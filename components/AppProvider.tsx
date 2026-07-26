"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seedState } from "@/lib/seed";
import type {
  Account,
  AppState,
  Conversation,
  ExperienceItem,
  InterestRecord,
  Message,
  Opportunity,
  OrganizationProfile,
  OutreachLead,
  Role,
  Session,
  StudentProfile,
} from "@/lib/types";
import { id } from "@/lib/utils";

const STORAGE_KEY = "myin.demo.v3";
const SESSION_KEY = "myin.session.v3";

interface CreateAccountInput {
  role: Role;
  username: string;
  password: string;
  displayName: string;
  email?: string;
  zip?: string;
  age?: number;
}

interface AppContextValue {
  ready: boolean;
  state: AppState;
  session: Session | null;
  currentAccount: Account | null;
  currentStudent: StudentProfile | null;
  currentOrganization: OrganizationProfile | null;
  login: (username: string, password: string) => { ok: boolean; message: string };
  logout: () => void;
  createAccount: (input: CreateAccountInput) => { ok: boolean; message: string };
  updateStudent: (profile: StudentProfile) => void;
  updateOrganization: (profile: OrganizationProfile) => void;
  publishOpportunity: (opportunity: Opportunity) => void;
  toggleSaved: (studentId: string, opportunityId: string) => void;
  dismissOpportunity: (studentId: string, opportunityId: string) => void;
  expressInterest: (studentId: string, opportunityId: string) => InterestRecord;
  sendMessage: (conversationId: string, senderRole: Role, senderLabel: string, text: string, moderation?: "clear" | "flagged") => void;
  requestIntroduction: (interestId: string) => void;
  addExperience: (studentId: string, item: ExperienceItem) => void;
  addOutreachLead: (lead: OutreachLead) => void;
  updateOutreachLead: (lead: OutreachLead) => void;
  refreshMatches: () => void;
  resetDemo: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function mergeLegacyState(base: AppState): AppState {
  if (typeof window === "undefined") return base;
  const keys = ["myin-profile", "myin_profile", "myinState", "myin-state"];
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const legacy = JSON.parse(raw) as Record<string, unknown>;
      const candidate = (legacy.profile || legacy.student || legacy) as Record<string, unknown>;
      const student = base.students[0];
      const mergeArray = (value: unknown, fallback: string[]) =>
        Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : fallback;
      base.students[0] = {
        ...student,
        name: typeof candidate.name === "string" && candidate.name.trim() ? candidate.name : student.name,
        age: typeof candidate.age === "number" ? candidate.age : student.age,
        zip: typeof candidate.zip === "string" ? candidate.zip : student.zip,
        skills: mergeArray(candidate.skills, student.skills),
        interests: mergeArray(candidate.interests, student.interests),
        careerGoals: mergeArray(candidate.careerGoals || candidate.goals, student.careerGoals),
        bio: typeof candidate.bio === "string" ? candidate.bio : student.bio,
        lastUpdated: new Date().toISOString(),
      };
      base.accounts[0] = { ...base.accounts[0], displayName: base.students[0].name };
      break;
    } catch {
      // Ignore unknown legacy shapes instead of breaking the demo.
    }
  }
  return base;
}

function loadState(): AppState {
  if (typeof window === "undefined") return seedState();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AppState;
      if (parsed.version === 3 && Array.isArray(parsed.accounts)) return parsed;
    }
  } catch {
    // Seed state below.
  }
  return mergeLegacyState(seedState());
}

function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? (JSON.parse(stored) as Session) : null;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => seedState());
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadState());
    setSession(loadSession());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  useEffect(() => {
    if (!ready) return;
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  }, [ready, session]);

  const currentAccount = useMemo(
    () => state.accounts.find((account) => account.id === session?.accountId) || null,
    [session, state.accounts],
  );
  const currentStudent = useMemo(
    () => (currentAccount?.role === "student" ? state.students.find((student) => student.id === currentAccount.profileId) || null : null),
    [currentAccount, state.students],
  );
  const currentOrganization = useMemo(
    () => (currentAccount?.role === "organization" ? state.organizations.find((org) => org.id === currentAccount.profileId) || null : null),
    [currentAccount, state.organizations],
  );

  const login = useCallback(
    (username: string, password: string) => {
      const account = state.accounts.find(
        (item) => item.username.toLowerCase() === username.trim().toLowerCase() && item.password === password,
      );
      if (!account) return { ok: false, message: "That demo username or password was not found." };
      setSession({ accountId: account.id, role: account.role });
      return { ok: true, message: `Welcome, ${account.displayName}.` };
    },
    [state.accounts],
  );

  const logout = useCallback(() => setSession(null), []);

  const createAccount = useCallback(
    (input: CreateAccountInput) => {
      const username = input.username.trim();
      if (username.length < 3 || input.password.length < 4 || input.displayName.trim().length < 2) {
        return { ok: false, message: "Use a name, a username with at least 3 characters, and a password with at least 4 characters." };
      }
      if (state.accounts.some((account) => account.username.toLowerCase() === username.toLowerCase())) {
        return { ok: false, message: "That username is already used in this browser demo." };
      }
      const accountId = id("account");
      const profileId = id(input.role === "student" ? "student" : "org");
      const account: Account = {
        id: accountId,
        role: input.role,
        username,
        password: input.password,
        displayName: input.displayName.trim(),
        profileId,
        createdAt: new Date().toISOString(),
      };

      setState((current) => {
        if (input.role === "student") {
          const student: StudentProfile = {
            id: profileId,
            accountId,
            name: input.displayName.trim(),
            age: input.age || 15,
            grade: "",
            zip: input.zip || "",
            city: "",
            travelMiles: 15,
            skills: [],
            interests: [],
            careerGoals: [],
            causes: [],
            strengths: [],
            growthAreas: [],
            opportunityTypes: ["Internship", "Volunteer", "Mentorship"],
            formats: ["Remote", "Hybrid", "In person"],
            preferredPaid: "Either",
            experienceLevel: "Beginner",
            availableDays: [],
            weeklyHours: 5,
            jummahAvailability: "Needs flexibility",
            prayerBreaks: true,
            prayerSpace: true,
            halalFood: true,
            urgentOptIn: false,
            flexibility: "",
            transportation: "",
            accommodations: "",
            discoverable: false,
            guardianApproval: false,
            bio: "",
            freeText: "",
            experiences: [],
            verifiedServiceHours: 0,
            lastUpdated: new Date().toISOString(),
          };
          return {
            ...current,
            accounts: [...current.accounts, account],
            students: [...current.students, student],
            savedOpportunityIds: { ...current.savedOpportunityIds, [student.id]: [] },
            dismissedOpportunityIds: { ...current.dismissedOpportunityIds, [student.id]: [] },
            appliedOpportunityIds: { ...current.appliedOpportunityIds, [student.id]: [] },
          };
        }
        const organization: OrganizationProfile = {
          id: profileId,
          accountId,
          name: input.displayName.trim(),
          website: "",
          email: input.email || "",
          mission: "",
          programs: [],
          audience: [],
          location: "",
          contactName: "",
          phone: "",
          youthSafety: "",
          privacyStandards: "",
          accommodations: "",
          verified: false,
          lastUpdated: new Date().toISOString(),
        };
        return { ...current, accounts: [...current.accounts, account], organizations: [...current.organizations, organization] };
      });
      setSession({ accountId, role: input.role });
      return { ok: true, message: "Demo account created in this browser." };
    },
    [state.accounts],
  );

  const updateStudent = useCallback((profile: StudentProfile) => {
    setState((current) => ({
      ...current,
      students: current.students.map((student) => (student.id === profile.id ? { ...profile, lastUpdated: new Date().toISOString() } : student)),
      accounts: current.accounts.map((account) => (account.profileId === profile.id ? { ...account, displayName: profile.name } : account)),
    }));
  }, []);

  const updateOrganization = useCallback((profile: OrganizationProfile) => {
    setState((current) => ({
      ...current,
      organizations: current.organizations.map((org) => (org.id === profile.id ? { ...profile, lastUpdated: new Date().toISOString() } : org)),
      accounts: current.accounts.map((account) => (account.profileId === profile.id ? { ...account, displayName: profile.name } : account)),
    }));
  }, []);

  const publishOpportunity = useCallback((opportunity: Opportunity) => {
    setState((current) => ({ ...current, opportunities: [opportunity, ...current.opportunities.filter((item) => item.id !== opportunity.id)] }));
  }, []);

  const toggleSaved = useCallback((studentId: string, opportunityId: string) => {
    setState((current) => {
      const existing = current.savedOpportunityIds[studentId] || [];
      const next = existing.includes(opportunityId) ? existing.filter((idValue) => idValue !== opportunityId) : [...existing, opportunityId];
      return { ...current, savedOpportunityIds: { ...current.savedOpportunityIds, [studentId]: next } };
    });
  }, []);

  const dismissOpportunity = useCallback((studentId: string, opportunityId: string) => {
    setState((current) => {
      const existing = current.dismissedOpportunityIds[studentId] || [];
      return existing.includes(opportunityId)
        ? current
        : { ...current, dismissedOpportunityIds: { ...current.dismissedOpportunityIds, [studentId]: [...existing, opportunityId] } };
    });
  }, []);

  const expressInterest = useCallback(
    (studentId: string, opportunityId: string) => {
      const opportunity = state.opportunities.find((item) => item.id === opportunityId);
      if (!opportunity) throw new Error("Opportunity not found");
      const existing = state.interests.find((item) => item.studentId === studentId && item.opportunityId === opportunityId);
      if (existing) return existing;
      const interest: InterestRecord = {
        id: id("interest"),
        studentId,
        opportunityId,
        organizationId: opportunity.orgId,
        createdAt: new Date().toISOString(),
        status: "interested",
      };
      const conversation: Conversation = {
        id: id("conversation"),
        opportunityId,
        studentId,
        organizationId: opportunity.orgId,
        studentInitiated: true,
        introductionStatus: "controlled",
        messages: [
          {
            id: id("message"),
            conversationId: "pending",
            senderRole: "student",
            senderLabel: "Student interest signal",
            text: "I am interested in learning more about this opportunity through MYIN’s controlled introduction process.",
            createdAt: new Date().toISOString(),
            moderation: "clear",
          },
        ],
      };
      conversation.messages[0].conversationId = conversation.id;
      setState((current) => {
        const alreadyExists = current.interests.some(
          (item) => item.studentId === studentId && item.opportunityId === opportunityId,
        );
        if (alreadyExists) return current;
        const appliedIds = current.appliedOpportunityIds[studentId] || [];
        return {
          ...current,
          interests: [...current.interests, interest],
          conversations: [...current.conversations, conversation],
          appliedOpportunityIds: {
            ...current.appliedOpportunityIds,
            [studentId]: appliedIds.includes(opportunityId) ? appliedIds : [...appliedIds, opportunityId],
          },
        };
      });
      return interest;
    },
    [state.interests, state.opportunities],
  );

  const sendMessage = useCallback(
    (conversationId: string, senderRole: Role, senderLabel: string, text: string, moderation: "clear" | "flagged" = "clear") => {
      const message: Message = {
        id: id("message"),
        conversationId,
        senderRole,
        senderLabel,
        text,
        createdAt: new Date().toISOString(),
        moderation,
      };
      setState((current) => ({
        ...current,
        conversations: current.conversations.map((conversation) =>
          conversation.id === conversationId ? { ...conversation, messages: [...conversation.messages, message] } : conversation,
        ),
      }));
    },
    [],
  );

  const requestIntroduction = useCallback((interestId: string) => {
    setState((current) => {
      const interest = current.interests.find((item) => item.id === interestId);
      if (!interest) return current;
      return {
        ...current,
        interests: current.interests.map((item) => (item.id === interestId ? { ...item, status: "introduction-requested" } : item)),
        conversations: current.conversations.map((conversation) =>
          conversation.opportunityId === interest.opportunityId && conversation.studentId === interest.studentId
            ? { ...conversation, introductionStatus: "requested" }
            : conversation,
        ),
      };
    });
  }, []);

  const addExperience = useCallback((studentId: string, item: ExperienceItem) => {
    setState((current) => ({
      ...current,
      students: current.students.map((student) => (student.id === studentId ? { ...student, experiences: [item, ...student.experiences] } : student)),
    }));
  }, []);

  const addOutreachLead = useCallback((lead: OutreachLead) => {
    setState((current) => ({ ...current, outreachLeads: [lead, ...current.outreachLeads] }));
  }, []);

  const updateOutreachLead = useCallback((lead: OutreachLead) => {
    setState((current) => ({ ...current, outreachLeads: current.outreachLeads.map((item) => (item.id === lead.id ? lead : item)) }));
  }, []);

  const refreshMatches = useCallback(() => {
    setState((current) => ({ ...current, lastMatchRefresh: new Date().toISOString() }));
  }, []);

  const resetDemo = useCallback(() => {
    setState(seedState());
    setSession(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      state,
      session,
      currentAccount,
      currentStudent,
      currentOrganization,
      login,
      logout,
      createAccount,
      updateStudent,
      updateOrganization,
      publishOpportunity,
      toggleSaved,
      dismissOpportunity,
      expressInterest,
      sendMessage,
      requestIntroduction,
      addExperience,
      addOutreachLead,
      updateOutreachLead,
      refreshMatches,
      resetDemo,
    }),
    [
      ready,
      state,
      session,
      currentAccount,
      currentStudent,
      currentOrganization,
      login,
      logout,
      createAccount,
      updateStudent,
      updateOrganization,
      publishOpportunity,
      toggleSaved,
      dismissOpportunity,
      expressInterest,
      sendMessage,
      requestIntroduction,
      addExperience,
      addOutreachLead,
      updateOutreachLead,
      refreshMatches,
      resetDemo,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
