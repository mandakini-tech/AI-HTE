from pathlib import Path
import pandas as pd

DATASET_DIR = Path(__file__).resolve().parent.parent.parent / "dataset"

# Cached DataFrame
_institutions_df = None


def get_institutions_df() -> pd.DataFrame:
    """Load, clean, deduplicate, and return institutions dataset."""
    global _institutions_df
    if _institutions_df is None:
        filepath = DATASET_DIR / "institutions.csv"
        if not filepath.exists():
            raise FileNotFoundError(f"Dataset not found: {filepath}")

        df = pd.read_csv(filepath)
        df = df.drop_duplicates()

        # Clean numeric columns
        num_cols = [
            "Students",
            "Students Male",
            "Students Female",
            "Teachers",
            "Placement Percentage",
            "Scholarships",
            "Pass Percentage",
            "Attendance Percentage",
            "Infrastructure Score",
            "AI Risk Score",
            "Budget Lakhs",
            "Academic Year",
        ]
        for col in num_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype(int)

        # Clean string columns
        str_cols = ["College Name", "University Name", "District", "NAAC Grade"]
        for col in str_cols:
            if col in df.columns:
                df[col] = df[col].fillna("").astype(str).str.strip()

        _institutions_df = df

    return _institutions_df


