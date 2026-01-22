"use client"

import { useState } from "react"

type FormState = {
  name: string
  email: string
  mobile: string
  current_location: string
  preferred_job_location: string
  highest_qualification: string
  job_role: string
}

type ApiError =
  | string
  | { loc?: (string | number)[]; msg?: string; type?: string }

export default function Home() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    mobile: "",
    current_location: "",
    preferred_job_location: "",
    highest_qualification: "",
    job_role: "",
  })

  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [createdUserId, setCreatedUserId] = useState<number | null>(null)

  const [step, setStep] = useState<1 | 2>(1)
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setResumeFile(file)
  }

  const submitForm = async () => {
    setMessage("")
    setErrors([])
    setCreatedUserId(null)

    if (!form.job_role) {
      setErrors(["Please select a job role"])
      return
    }

    setLoading(true)

    try {
      const res = await fetch("http://127.0.0.1:8000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        if (Array.isArray(data.detail)) {
          const msgs = (data.detail as ApiError[]).map((err) =>
            typeof err === "string" ? err : err.msg || "Invalid input",
          )
          setErrors(msgs)
        } else if (typeof data.detail === "string") {
          setErrors([data.detail])
        } else {
          setErrors(["Something went wrong"])
        }
        setLoading(false)
        return
      }

      setCreatedUserId(data.id)
      setMessage("Profile saved. Now upload your resume.")
      setStep(2)
    } catch {
      setErrors(["Backend server not running"])
    }

    setLoading(false)
  }

  const uploadResume = async () => {
    if (!createdUserId) {
      setErrors(["Create profile before uploading resume"])
      return
    }
    if (!resumeFile) {
      setErrors(["Please choose a resume file"])
      return
    }

    setErrors([])
    setMessage("")
    setUploadingResume(true)

    try {
      const formData = new FormData()
      formData.append("file", resumeFile)

      const res = await fetch(
        `http://127.0.0.1:8000/users/${createdUserId}/upload-resume`,
        {
          method: "POST",
          body: formData,
        },
      )

      const data = await res.json()

      if (!res.ok) {
        setErrors([data.detail || "Failed to upload resume"])
        setUploadingResume(false)
        return
      }

      setMessage("Resume uploaded successfully. Your application is complete.")
      setResumeFile(null)
    } catch {
      setErrors(["Backend server not running"])
    }

    setUploadingResume(false)
  }

  return (
    <div className="page">
      <main className="container">
        <header className="header">
          <div>
            <p className="eyebrow">Candidate portal</p>
            <h1>Complete your candidate profile</h1>
            <p className="sub">
              Share your key details and upload your resume so recruiters can quickly
              understand your profile and contact you.
            </p>
          </div>
        </header>

        <section className="layout">
          <aside className="side">
            <div className="panel">
              <p className="panel-title">Steps</p>
              <div className="steps">
                <div
                  className={
                    "step" +
                    (step === 1 ? " step-active" : "") +
                    (step > 1 ? " step-done" : "")
                  }
                >
                  <span className="step-index">1</span>
                  <div>
                    <p className="step-label">Profile details</p>
                    <p className="step-desc">Basic info and preferences</p>
                  </div>
                </div>
                <div className={"step" + (step === 2 ? " step-active" : "")}>
                  <span className="step-index">2</span>
                  <div>
                    <p className="step-label">Resume upload</p>
                    <p className="step-desc">Attach your latest resume</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel panel-secondary">
              <p className="panel-title">Tips</p>
              <ul className="tips-list">
                <li>Use a professional email and updated phone number.</li>
                <li>Keep locations realistic for where you can work.</li>
                <li>Always upload your latest resume version.</li>
              </ul>
            </div>
          </aside>

          <section className="card">
            {message && <div className="alert alert-success">{message}</div>}
            {errors.length > 0 && (
              <div className="alert alert-error">
                <ul>
                  {errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {step === 1 && (
              <>
                <div className="section section-tight">
                  <h2>Basic information</h2>
                  <div className="grid basic-grid">
                    <div className="field">
                      <label htmlFor="name">Full name</label>
                      <input
                        id="name"
                        name="name"
                        placeholder="e.g. Rahul Sharma"
                        value={form.name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="email">Email address</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="mobile">Mobile number</label>
                      <input
                        id="mobile"
                        name="mobile"
                        placeholder="+91 98765 43210"
                        value={form.mobile}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="section section-tight">
                  <h2>Location & education</h2>
                  <div className="grid">
                    <div className="field">
                      <label htmlFor="current_location">Current location</label>
                      <input
                        id="current_location"
                        name="current_location"
                        placeholder="Chennai"
                        value={form.current_location}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="preferred_job_location">
                        Preferred job location
                      </label>
                      <input
                        id="preferred_job_location"
                        name="preferred_job_location"
                        placeholder="Bengaluru / Remote"
                        value={form.preferred_job_location}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="highest_qualification">
                        Highest qualification
                      </label>
                      <input
                        id="highest_qualification"
                        name="highest_qualification"
                        placeholder="B.Tech CSE / MCA / etc."
                        value={form.highest_qualification}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="section section-tight">
                  <h2>Job role</h2>
                  <div className="field field-single">
                    <label htmlFor="job_role">Select role</label>
                    <select
                      id="job_role"
                      name="job_role"
                      value={form.job_role}
                      onChange={handleChange}
                    >
                      <option value="">Choose a role</option>
                      <option value="software_developer">Software Developer</option>
                      <option value="devops">DevOps Engineer</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={submitForm}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? "Saving profile..." : "Save profile and continue"}
                </button>
                <p className="hint-bottom">
                  Your profile can be updated later. This creates the first version.
                </p>
              </>
            )}

            {step === 2 && (
              <>
                <div className="section">
                  <h2>Upload resume</h2>
                  <p className="section-helper">
                    Attach a recent PDF resume. It will be linked to this profile.
                  </p>

                  <div className="upload">
                    <label className="upload-box" htmlFor="resume">
                      <div className="upload-icon">📄</div>
                      <div>
                        <p className="upload-title">Click to choose a PDF file</p>
                        <p className="upload-sub">PDF only, up to ~5 MB.</p>
                      </div>
                    </label>
                    <input
                      id="resume"
                      type="file"
                      accept=".pdf"
                      onChange={handleResumeChange}
                      className="file-input"
                    />
                    {resumeFile && (
                      <p className="file-name">Selected: {resumeFile.name}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={uploadResume}
                    disabled={uploadingResume}
                  >
                    {uploadingResume ? "Uploading..." : "Upload resume"}
                  </button>

                  {!createdUserId && (
                    <p className="section-helper error-helper">
                      No profile found. Go back to step 1, fill your details, and save
                      your profile first.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setStep(1)}
                >
                  ← Back to profile
                </button>
              </>
            )}
          </section>
        </section>
      </main>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #020617;
          padding: 32px 16px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #e5e7eb;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
            "Segoe UI", sans-serif;
        }

        .container {
          width: 100%;
          max-width: 1040px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .eyebrow {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #a5b4fc;
          margin-bottom: 4px;
        }

        h1 {
          margin: 0 0 6px;
          font-size: clamp(24px, 3vw, 30px);
          letter-spacing: -0.03em;
          color: #f9fafb;
        }

        .sub {
          margin: 0;
          max-width: 520px;
          font-size: 13px;
          color: #9ca3af;
        }

        .layout {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
          gap: 20px;
          align-items: flex-start;
        }

        .side {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .panel {
          background: #020617;
          border-radius: 14px;
          border: 1px solid #1f2937;
          padding: 12px 14px;
        }

        .panel-secondary {
          background: #020617;
        }

        .panel-title {
          margin: 0 0 8px;
          font-size: 12px;
          font-weight: 500;
          color: #d1d5db;
        }

        .steps {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .step {
          display: flex;
          gap: 8px;
          padding: 7px 8px;
          border-radius: 10px;
          align-items: center;
          background: transparent;
        }

        .step-active {
          background: #111827;
        }

        .step-done {
          background: #022c22;
        }

        .step-index {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          border: 1px solid #4b5563;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        .step-active .step-index {
          border-color: #38bdf8;
        }

        .step-done .step-index {
          border-color: #22c55e;
        }

        .step-label {
          margin: 0;
          font-size: 13px;
          color: #e5e7eb;
        }

        .step-desc {
          margin: 0;
          font-size: 11px;
          color: #9ca3af;
        }

        .tips-list {
          margin: 0;
          padding-left: 16px;
          font-size: 12px;
          color: #9ca3af;
        }

        .tips-list li + li {
          margin-top: 4px;
        }

        .card {
          background: #020617;
          border-radius: 16px;
          border: 1px solid #1f2937;
          padding: 14px 14px 12px;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.8);
        }

        .alert {
          border-radius: 10px;
          padding: 8px 10px;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .alert-success {
          background: #022c22;
          border: 1px solid #16a34a;
          color: #bbf7d0;
        }

        .alert-error {
          background: #450a0a;
          border: 1px solid #f97373;
          color: #fecaca;
        }

        .alert-error ul {
          margin: 0;
          padding-left: 18px;
        }

        .section {
          margin-top: 8px;
          margin-bottom: 8px;
        }

        /* Tighter spacing for main form sections */
        .section-tight {
          margin-top: 6px;
          margin-bottom: 4px;
        }

        .section h2 {
          margin: 0 0 6px;
          font-size: 14px;
          font-weight: 500;
          color: #e5e7eb;
        }

        .section-helper {
          margin: 2px 0 8px;
          font-size: 12px;
          color: #9ca3af;
        }

        .error-helper {
          color: #fecaca;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px 14px;
        }

        /* Basic info: 3 columns, tighter gaps */
        .basic-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px 12px;
          align-items: flex-start;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .field-single {
          max-width: 280px;
        }

        .field label {
          font-size: 12px;
          color: #9ca3af;
          margin-bottom: 1px;
        }

        input,
        select {
          padding: 7px 9px;
          border-radius: 7px;
          border: 1px solid #374151;
          background: #020617;
          color: #e5e7eb;
          font-size: 13px;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        input::placeholder {
          color: #6b7280;
        }

        input:focus,
        select:focus {
          outline: none;
          border-color: #38bdf8;
          box-shadow: 0 0 0 1px #38bdf8;
        }

        .upload {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 4px;
        }

        .upload-box {
          border-radius: 12px;
          border: 1px dashed #4b5563;
          background: #020617;
          padding: 10px 12px;
          display: flex;
          gap: 10px;
          align-items: center;
          cursor: pointer;
        }

        .upload-icon {
          width: 26px;
          height: 26px;
          border-radius: 8px;
          background: #111827;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .upload-title {
          margin: 0;
          font-size: 13px;
          color: #e5e7eb;
        }

        .upload-sub {
          margin: 0;
          font-size: 12px;
          color: #9ca3af;
        }

        .file-input {
          display: none;
        }

        .file-name {
          font-size: 12px;
          color: #cbd5f5;
        }

        .btn {
          border-radius: 999px;
          border: none;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          padding: 9px 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;
        }

        .btn-primary {
          width: 100%;
          margin-top: 10px;
          background: #38bdf8;
          color: #020617;
          box-shadow: 0 14px 30px rgba(56, 189, 248, 0.35);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 18px 38px rgba(56, 189, 248, 0.45);
        }

        .btn-secondary {
          margin-top: 8px;
          background: #020617;
          color: #e5e7eb;
          border: 1px solid #4b5563;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #111827;
        }

        .btn-ghost {
          margin-top: 8px;
          background: transparent;
          color: #9ca3af;
        }

        .btn-ghost:hover {
          color: #e5e7eb;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }

        .hint-bottom {
          margin-top: 5px;
          font-size: 11px;
          color: #6b7280;
          text-align: right;
        }

        @media (max-width: 900px) {
          .layout {
            grid-template-columns: minmax(0, 1fr);
          }

          .side {
            order: 2;
          }

          .card {
            order: 1;
          }
        }

        @media (max-width: 640px) {
          .page {
            padding: 24px 12px;
          }

          .card {
            padding: 12px 12px 10px;
          }

          .grid,
          .basic-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  )
}
