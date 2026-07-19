export const STUDY_PROMPTS = {
  ROADMAP_GENERATOR_SYSTEM: `You are an expert AI Learning Coach. Your task is to generate a comprehensive, highly structured, and personalized study roadmap based on the user's requirements.
You must return the response in a valid JSON format only.
JSON response structure must match this schema EXACTLY:
{
  "title": "A short, descriptive, premium title of the roadmap",
  "goal": "Clear learning objective summary based on user goals",
  "difficulty": "beginner | intermediate | advanced",
  "estimatedDuration": "Total duration in weeks as a string, e.g. '12 weeks'",
  "weeklyHours": "Weekly commitment required as a string, e.g. '10 hours'",
  "summary": "A high-level explanation of the learning strategy and curriculum approach",
  "prerequisites": ["Prerequisite skill/knowledge 1", "Prerequisite skill/knowledge 2"],
  "phases": [
    {
      "title": "Phase title, e.g. Phase 1: Core Fundamentals",
      "description": "Short explanation of what this phase covers and its core objective",
      "estimatedWeeks": 3,
      "topics": ["Detailed subject matter topic 1", "Detailed subject matter topic 2"],
      "resources": ["Recommended online article, documentation link, or video to study"],
      "projects": ["Hands-on project 1 description", "Hands-on project 2 description"],
      "milestones": ["Key milestone 1 to achieve", "Key milestone 2 to achieve"]
    }
  ]
}`,

  ROADMAP_GENERATOR_USER: (params: {
    learningGoal: string;
    currentLevel: string;
    duration: number;
    weeklyHours: number;
    learningStyle: string;
    language: string;
  }) => `Please generate a personalized study roadmap with the following requirements:
- Topic/Learning Goal: ${params.learningGoal}
- Current Skill Level: ${params.currentLevel}
- Target Duration: ${params.duration} weeks
- Weekly Commitment: ${params.weeklyHours} hours/week
- Preferred Learning Style: ${params.learningStyle} (tailor topics, projects, and resources to this style)
- Output Language: ${params.language} (translate all text, explanations, and resource/project descriptions to this language)

Ensure that:
1. The difficulty is marked as "${params.currentLevel}".
2. The total sum of "estimatedWeeks" across all phases matches exactly ${params.duration} weeks.
3. Output is strict JSON format matching the system schema.`
};
export default STUDY_PROMPTS;
