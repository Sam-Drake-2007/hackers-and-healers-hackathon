from pydantic import BaseModel, Field


class PatientRecord(BaseModel):
    chief_complaint: str = Field(default="", description="Primary reason for the visit")
    history_of_present_illness: str = Field(default="", description="Onset, duration, progression, aggravating/relieving factors")
    past_medical_history: str = Field(default="", description="Prior conditions, surgeries, hospitalizations")
    medications: list[str] = Field(default_factory=list, description="Current medications and dosages")
    allergies: list[str] = Field(default_factory=list, description="Drug and other allergies with reactions")
    social_history: str = Field(default="", description="Smoking, alcohol, occupation, relevant lifestyle")
    review_of_systems: str = Field(default="", description="Relevant systems reviewed beyond the chief complaint")
    additional_notes: str = Field(default="", description="Any other clinically relevant information")
