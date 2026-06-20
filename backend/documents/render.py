from datetime import date
from jinja2 import Environment, BaseLoader
from documents.record import PatientRecord

_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-size: 11pt;
      color: #2a2526;
      background: #fff;
      padding: 40px 48px;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #b2f2c3;
      padding-bottom: 16px;
      margin-bottom: 28px;
    }

    header .clinic { font-size: 18pt; font-weight: 700; color: #2a2526; }
    header .meta   { font-size: 9pt; color: #6b6a6b; text-align: right; }

    h2 {
      font-size: 10pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #6b6a6b;
      margin-bottom: 6px;
    }

    .section {
      margin-bottom: 22px;
      padding-bottom: 22px;
      border-bottom: 1px solid #e5e6e7;
    }
    .section:last-child { border-bottom: none; }

    .value {
      font-size: 11pt;
      color: #2a2526;
      line-height: 1.6;
      white-space: pre-wrap;
    }

    .empty { color: #a6a4a4; font-style: italic; }

    ul {
      margin: 0;
      padding-left: 20px;
      line-height: 1.8;
    }

    footer {
      margin-top: 36px;
      font-size: 8pt;
      color: #a6a4a4;
      text-align: center;
    }
  </style>
</head>
<body>

  <header>
    <div class="clinic">Patient Intake Record</div>
    <div class="meta">
      Generated {{ date }}<br />
      Confidential — for clinical use only
    </div>
  </header>

  <div class="section">
    <h2>Chief Complaint</h2>
    {% if record.chief_complaint %}
      <p class="value">{{ record.chief_complaint }}</p>
    {% else %}
      <p class="empty">Not provided</p>
    {% endif %}
  </div>

  <div class="section">
    <h2>History of Present Illness</h2>
    {% if record.history_of_present_illness %}
      <p class="value">{{ record.history_of_present_illness }}</p>
    {% else %}
      <p class="empty">Not provided</p>
    {% endif %}
  </div>

  <div class="section">
    <h2>Past Medical History</h2>
    {% if record.past_medical_history %}
      <p class="value">{{ record.past_medical_history }}</p>
    {% else %}
      <p class="empty">Not provided</p>
    {% endif %}
  </div>

  <div class="section">
    <h2>Current Medications</h2>
    {% if record.medications %}
      <ul>
        {% for med in record.medications %}
          <li class="value">{{ med }}</li>
        {% endfor %}
      </ul>
    {% else %}
      <p class="empty">None reported</p>
    {% endif %}
  </div>

  <div class="section">
    <h2>Allergies</h2>
    {% if record.allergies %}
      <ul>
        {% for allergy in record.allergies %}
          <li class="value">{{ allergy }}</li>
        {% endfor %}
      </ul>
    {% else %}
      <p class="empty">None reported</p>
    {% endif %}
  </div>

  <div class="section">
    <h2>Social History</h2>
    {% if record.social_history %}
      <p class="value">{{ record.social_history }}</p>
    {% else %}
      <p class="empty">Not provided</p>
    {% endif %}
  </div>

  <div class="section">
    <h2>Review of Systems</h2>
    {% if record.review_of_systems %}
      <p class="value">{{ record.review_of_systems }}</p>
    {% else %}
      <p class="empty">Not provided</p>
    {% endif %}
  </div>

  {% if record.additional_notes %}
  <div class="section">
    <h2>Additional Notes</h2>
    <p class="value">{{ record.additional_notes }}</p>
  </div>
  {% endif %}

  <footer>
    This record was generated automatically from an AI-assisted patient intake interview.
    Clinical staff should verify all information directly with the patient.
  </footer>

</body>
</html>"""

_env = Environment(loader=BaseLoader())
_template = _env.from_string(_TEMPLATE)


def render_html(record: PatientRecord) -> str:
    return _template.render(
        record=record,
        date=date.today().strftime("%B %d, %Y"),
    )
