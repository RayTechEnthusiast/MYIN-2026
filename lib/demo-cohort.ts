import type { ExperienceItem, StudentProfile } from "./types";

const now = "2026-07-26T06:45:00.000Z";

interface DemoStudentInput {
  id: string;
  name: string;
  age: number;
  grade: string;
  zip: string;
  city: string;
  skills: string[];
  interests: string[];
  careerGoals: string[];
  causes: string[];
  strengths: string[];
  growthAreas: string[];
  availableDays: string[];
  weeklyHours: number;
  experienceLevel: StudentProfile["experienceLevel"];
  formats: StudentProfile["formats"];
  bio: string;
  experiences: ExperienceItem[];
}

const makeDemoStudent = (input: DemoStudentInput): StudentProfile => ({
  id: input.id,
  accountId: `synthetic_${input.id}`,
  name: input.name,
  age: input.age,
  grade: input.grade,
  zip: input.zip,
  city: input.city,
  travelMiles: 20,
  skills: input.skills,
  interests: input.interests,
  careerGoals: input.careerGoals,
  causes: input.causes,
  strengths: input.strengths,
  growthAreas: input.growthAreas,
  opportunityTypes: ["Internship", "Volunteer", "Mentorship", "Community Project"],
  formats: input.formats,
  preferredPaid: "Either",
  experienceLevel: input.experienceLevel,
  availableDays: input.availableDays,
  weeklyHours: input.weeklyHours,
  jummahAvailability: "Needs flexibility",
  prayerBreaks: true,
  prayerSpace: true,
  halalFood: true,
  urgentOptIn: true,
  flexibility: "Synthetic demo profile used only to demonstrate aggregate community intelligence.",
  transportation: "Demo transportation preference.",
  accommodations: "Prayer flexibility preferred; synthetic demonstration data only.",
  discoverable: true,
  guardianApproval: true,
  bio: input.bio,
  freeText: "Synthetic profile created for the MYIN hackathon demonstration.",
  experiences: input.experiences,
  verifiedServiceHours: input.experiences.reduce((sum, item) => sum + (item.hours || 0), 0),
  lastUpdated: now,
});

export const demoCohortStudents: StudentProfile[] = [
  makeDemoStudent({
    id: "student_cohort_idris",
    name: "Idris Khan",
    age: 16,
    grade: "11th grade",
    zip: "20850",
    city: "Rockville, MD",
    skills: ["Python", "Arduino", "CAD", "Teamwork"],
    interests: ["Technology", "Robotics", "Community service"],
    careerGoals: ["Engineering", "Technology"],
    causes: ["STEM access", "Muslim community development"],
    strengths: ["Problem solving", "Curiosity"],
    growthAreas: ["Public speaking", "Project planning"],
    availableDays: ["Saturday", "Sunday"],
    weeklyHours: 6,
    experienceLevel: "Beginner",
    formats: ["Hybrid", "In person"],
    bio: "Synthetic student interested in supervised robotics and engineering experiences.",
    experiences: [
      {
        id: "exp_cohort_idris",
        title: "School Robotics Builder",
        organization: "Synthetic School Team",
        description: "Built and tested a small sensor prototype with a student team.",
        skills: ["Arduino", "Teamwork"],
        hours: 14,
        verification: "self-entered",
      },
    ],
  }),
  makeDemoStudent({
    id: "student_cohort_maryam",
    name: "Maryam Ali",
    age: 15,
    grade: "10th grade",
    zip: "20910",
    city: "Silver Spring, MD",
    skills: ["Communication", "Bilingual outreach", "Data entry"],
    interests: ["Healthcare", "Community service", "Youth education"],
    careerGoals: ["Healthcare", "Community leadership"],
    causes: ["Health access", "Youth education"],
    strengths: ["Empathy", "Organization"],
    growthAreas: ["Clinical vocabulary", "Leadership"],
    availableDays: ["Saturday", "Sunday"],
    weeklyHours: 5,
    experienceLevel: "Beginner",
    formats: ["In person", "Hybrid"],
    bio: "Synthetic student seeking a supervised introduction to community health service.",
    experiences: [
      {
        id: "exp_cohort_maryam",
        title: "Community Event Greeter",
        organization: "Synthetic Community Center",
        description: "Welcomed families and organized registration materials.",
        skills: ["Communication", "Data entry"],
        hours: 10,
        verification: "organization-confirmed",
      },
    ],
  }),
  makeDemoStudent({
    id: "student_cohort_zayd",
    name: "Zayd Hassan",
    age: 17,
    grade: "12th grade",
    zip: "20877",
    city: "Gaithersburg, MD",
    skills: ["Excel", "Basic coding", "Video editing", "Social media"],
    interests: ["Technology", "Entrepreneurship", "Digital media"],
    careerGoals: ["Business", "Technology"],
    causes: ["Small business support", "Youth employment"],
    strengths: ["Initiative", "Digital storytelling"],
    growthAreas: ["Financial modeling", "Professional networking"],
    availableDays: ["Friday", "Saturday"],
    weeklyHours: 8,
    experienceLevel: "Developing",
    formats: ["Remote", "Hybrid"],
    bio: "Synthetic student interested in technology-enabled business and media projects.",
    experiences: [
      {
        id: "exp_cohort_zayd",
        title: "Student Market Project",
        organization: "Synthetic Business Club",
        description: "Tracked sales in Excel and edited short promotional videos.",
        skills: ["Excel", "Video editing"],
        hours: 20,
        verification: "self-entered",
      },
    ],
  }),
  makeDemoStudent({
    id: "student_cohort_safiya",
    name: "Safiya Noor",
    age: 16,
    grade: "11th grade",
    zip: "20814",
    city: "Bethesda, MD",
    skills: ["Research", "Canva", "Public speaking", "Writing"],
    interests: ["Technology", "Environmental sustainability", "Community service"],
    careerGoals: ["Environmental science", "Technology"],
    causes: ["Sustainability", "Community education"],
    strengths: ["Research", "Communication"],
    growthAreas: ["Data visualization", "Field experience"],
    availableDays: ["Saturday"],
    weeklyHours: 4,
    experienceLevel: "Beginner",
    formats: ["Hybrid", "In person"],
    bio: "Synthetic student interested in technology projects with environmental impact.",
    experiences: [
      {
        id: "exp_cohort_safiya",
        title: "Eco Club Presenter",
        organization: "Synthetic School Eco Club",
        description: "Researched waste reduction and presented recommendations to classmates.",
        skills: ["Research", "Public speaking"],
        hours: 12,
        verification: "organization-confirmed",
      },
    ],
  }),
  makeDemoStudent({
    id: "student_cohort_hamza",
    name: "Hamza Rahman",
    age: 16,
    grade: "11th grade",
    zip: "20852",
    city: "North Bethesda, MD",
    skills: ["Tutoring", "Python", "Leadership", "Communication"],
    interests: ["Technology", "Youth education", "Community service"],
    careerGoals: ["Engineering", "Community leadership"],
    causes: ["Education access", "Muslim community development"],
    strengths: ["Patience", "Leadership"],
    growthAreas: ["Design", "Documentation"],
    availableDays: ["Sunday"],
    weeklyHours: 6,
    experienceLevel: "Developing",
    formats: ["Remote", "Hybrid", "In person"],
    bio: "Synthetic student interested in combining technical learning with youth mentorship.",
    experiences: [
      {
        id: "exp_cohort_hamza",
        title: "Weekend Coding Tutor",
        organization: "Synthetic Study Circle",
        description: "Helped younger students understand introductory programming exercises.",
        skills: ["Tutoring", "Python", "Communication"],
        hours: 18,
        verification: "organization-confirmed",
      },
    ],
  }),
];
