// Fallback data for roles in case the backend is not available
export const fallbackRoles = [
  {
    "id": "recruiter",
    "name": "Recruiter/HR",
    "description": "Specialized in recruitment and selection information",
    "icon": "👔",
    "color": "#3B82F6",
    "focus_areas": [
      "professional_experience",
      "soft_skills",
      "highlighted_projects",
      "certifications",
      "career_goals"
    ],
    "tone": "professional",
    "prompt_modifiers": {
      "prefix": "You are talking to a recruiter. Focus on:",
      "emphasis": [
        "Quantifiable results",
        "Relevant experience",
        "Transferable skills",
        "Growth potential",
        "Teamwork",
        "Adaptability and learning",
        "Clear career goals"
      ],
      "avoid": [
        "Very specific technical details",
        "Advanced programming jargon",
        "Unnecessary personal information",
        "Excessive focus on unrelated hobbies"
      ]
    },
    "example_questions": [
      "What are Hamza's main projects?",
      "How does he work in a team?",
      "What are his career goals?",
      "What kind of challenges has he faced?",
      "How does he deal with deadlines and pressure?",
      "What are his main professional achievements?"
    ]
  },
  {
    "id": "developer",
    "name": "Developer/Technical",
    "description": "Focused on technical skills and code knowledge",
    "icon": "💻",
    "color": "#10B981",
    "focus_areas": [
      "programming_languages",
      "frameworks",
      "architecture",
      "technical_projects",
      "code_challenges"
    ],
    "tone": "technical",
    "prompt_modifiers": {
      "prefix": "You are talking to a developer. Focus on:",
      "emphasis": [
        "Specific technical details",
        "Complete tech stack",
        "Project architecture",
        "Implementation challenges",
        "Best coding practices",
        "Design patterns used",
        "Performance and optimization",
        "API and service integration"
      ],
      "avoid": [
        "Very generic information",
        "Excessive focus on soft skills",
        "Non-technical details",
        "Very basic explanations"
      ]
    },
    "example_questions": [
      "What tech stack does he use?",
      "How does he structure his projects?",
      "What technical challenges has he solved?",
      "What code patterns does he follow?",
      "How does he integrate with external APIs?",
      "What frameworks does he master?",
      "How does he handle performance?"
    ]
  },
  {
    "id": "student",
    "name": "Student/Beginner",
    "description": "Focused on academic background and growth potential",
    "icon": "🎓",
    "color": "#F59E0B",
    "focus_areas": [
      "academic_background",
      "certifications",
      "academic_projects",
      "growth_potential",
      "learning_interests"
    ],
    "tone": "motivational",
    "prompt_modifiers": {
      "prefix": "You are talking to a student. Focus on:",
      "emphasis": [
        "Academic background and education",
        "Certifications and completed courses",
        "Academic and learning projects",
        "Growth and development potential",
        "Learning interests",
        "Motivation and dedication to studies",
        "Skills in development",
        "Educational goals"
      ],
      "avoid": [
        "Excessive focus on advanced professional experience",
        "Very complex technical details",
        "Pressure for immediate results",
        "Comparisons with experienced professionals"
      ]
    },
    "example_questions": [
      "What is Hamza's academic background?",
      "What certifications does he have?",
      "How does he learn new technologies?",
      "What are his study goals?",
      "What academic projects has he developed?",
      "How does he stay up to date?",
      "What are his areas of interest?"
    ]
  },
  {
    "id": "client",
    "name": "Client/Partner",
    "description": "Focused on delivery capability and added value",
    "icon": "🤝",
    "color": "#8B5CF6",
    "focus_areas": [
      "delivered_projects",
      "quantifiable_results",
      "practical_skills",
      "delivery_capability",
      "added_value"
    ],
    "tone": "commercial",
    "prompt_modifiers": {
      "prefix": "You are talking to a client/partner. Focus on:",
      "emphasis": [
        "Successfully delivered projects",
        "Quantifiable results and metrics",
        "Practical and applicable skills",
        "Delivery capability and meeting deadlines",
        "Added value to projects",
        "Solving real problems",
        "Quality of delivered work",
        "Experience in similar projects"
      ],
      "avoid": [
        "Very specific technical details",
        "Excessive focus on learning",
        "Unnecessary academic information",
        "Irrelevant internal processes"
      ]
    },
    "example_questions": [
      "What projects has he already delivered?",
      "How does he ensure the quality of his work?",
      "What are the results of his projects?",
      "How does he deal with deadlines and expectations?",
      "What value does he add to projects?",
      "How does he solve problems in projects?",
      "What is his experience with similar projects?"
    ]
  }
];

// Function to get role by ID
export const getRoleById = (id) => {
  return fallbackRoles.find(role => role.id === id);
};

// Function to get example questions by role
export const getRoleExamples = (roleId) => {
  const role = getRoleById(roleId);
  return role ? role.example_questions : [];
}; 