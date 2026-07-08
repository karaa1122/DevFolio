"""Extensible skill / technology taxonomy.

`CANONICAL_SKILLS` maps a canonical term -> list of accepted surface variants
(synonyms, abbreviations, common misspellings, casing variants). The taxonomy
is the single source of truth used by both the parser (to *recognise* skills in
free text) and the normalizer (to *standardise* them).

To extend the system, add an entry here — no code changes required.
"""
from __future__ import annotations

# canonical -> variants (variants are matched case-insensitively as whole words)
CANONICAL_SKILLS: dict[str, list[str]] = {
    # --- Languages ---
    "Python": ["py", "python3"],
    "JavaScript": ["js", "ecmascript", "java script"],
    "TypeScript": ["ts"],
    "Java": [],
    "Go": ["golang"],
    "C++": ["cpp", "cplusplus"],
    "C#": ["csharp", "c sharp"],
    "Ruby": [],
    "PHP": [],
    "Rust": [],
    "SQL": [],
    "Bash": ["shell", "shell scripting"],

    # --- Backend frameworks ---
    "FastAPI": ["fast api"],
    "Django": [],
    "Flask": [],
    "Node.js": ["node", "nodejs", "node js"],
    "Express.js": ["express", "expressjs"],
    "Spring Boot": ["spring", "springboot"],
    ".NET": ["dotnet", "asp.net", "aspnet"],

    # --- Frontend ---
    "React": ["react.js", "reactjs"],
    "Vue.js": ["vue", "vuejs"],
    "Angular": ["angular.js", "angularjs"],
    "HTML": ["html5"],
    "CSS": ["css3"],

    # --- Data / ML / NLP ---
    "Machine Learning": ["ml"],
    "Deep Learning": ["dl"],
    "NLP": ["natural language processing"],
    "PyTorch": ["torch"],
    "TensorFlow": ["tf", "tensor flow"],
    "scikit-learn": ["sklearn", "sci-kit learn", "scikit learn"],
    "Pandas": [],
    "NumPy": ["numpy"],
    "Transformers": ["huggingface", "hugging face", "sentence-transformers"],
    "Spark": ["apache spark", "pyspark"],

    # --- Databases ---
    "PostgreSQL": ["postgres", "psql", "postgresql"],
    "MySQL": ["my sql"],
    "MongoDB": ["mongo"],
    "Redis": [],
    "Elasticsearch": ["elastic search", "es"],
    "SQLite": [],

    # --- Cloud / DevOps ---
    "AWS": ["amazon web services"],
    "GCP": ["google cloud", "google cloud platform"],
    "Azure": ["microsoft azure"],
    "Docker": ["containerization"],
    "Kubernetes": ["k8s"],
    "Terraform": [],
    "CI/CD": ["cicd", "ci cd", "continuous integration", "continuous delivery"],
    "Microservices": ["micro-service", "micro service", "micro-services", "microservice"],
    "REST API": ["rest", "restful", "rest apis", "restful api"],
    "GraphQL": ["graph ql"],
    "gRPC": ["grpc"],
    "Kafka": ["apache kafka"],
    "RabbitMQ": ["rabbit mq"],
    "Git": ["github", "gitlab", "version control"],

    # --- Soft skills ---
    "Communication": ["communication skills", "communicator"],
    "Leadership": ["team lead", "leading teams"],
    "Teamwork": ["collaboration", "team player", "collaborative"],
    "Problem Solving": ["problem-solving", "analytical thinking"],
    "Agile": ["scrum", "kanban", "agile methodology"],
    "Mentoring": ["mentorship", "coaching"],
}

# Soft skills are tracked separately so scoring can weight them differently
# and the API can report them apart from hard technical skills.
SOFT_SKILLS: set[str] = {
    "Communication",
    "Leadership",
    "Teamwork",
    "Problem Solving",
    "Agile",
    "Mentoring",
}

# Seniority ladder used for experience/role matching.
SENIORITY_LEVELS: dict[str, int] = {
    "intern": 0,
    "junior": 1,
    "associate": 1,
    "mid": 2,
    "intermediate": 2,
    "senior": 3,
    "staff": 4,
    "lead": 4,
    "principal": 5,
    "architect": 5,
    "manager": 4,
    "head": 5,
    "director": 6,
    "vp": 7,
}
