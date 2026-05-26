import { User, Phone, AlertCircle, ArrowLeft, Check, Mail, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { validateRegistration } from "../services/authService";

export default function RegisterScreen({ onRegister, onBackToSignIn }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    emergencyContact: "",
    bloodGroup: "",
    medicalInfo: "",
    location: false,
    role: "user",
    governmentId: "",
    selfieFile: null,
    selfiePreview: "",
    idProofFile: null,
    idProofName: "",
    city: "",
    badgeId: "",
    stationName: "",
    officialEmail: "",
    hospitalName: "",
    registrationId: "",
    officerId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field, file) => {
    if (!file) return;
    setFormData((prev) => ({
      ...prev,
      [field]: file,
      ...(field === "selfieFile" ? { selfiePreview: URL.createObjectURL(file) } : { idProofName: file.name }),
    }));
  };

  const handleNext = () => {
    if (step < 3) {
      if (step === 1) {
        const required = ["fullName", "phone", "email", "password"];
        const missing = required.find((field) => !String(formData[field] || "").trim());
        if (missing) {
          const fieldName = missing === "fullName" ? "Full name" : missing[0].toUpperCase() + missing.slice(1);
          setError(`${fieldName} is required.`);
          return;
        }
      }
      setError("");
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {

    const validationError = validateRegistration(formData);
    if (validationError) {
      setError(validationError);
      alert("Validation Error: " + validationError);
      return;
    }

    setIsLoading(true);
    setError("");
    setUploadProgress(0);

    try {

      await onRegister({
        ...formData,
        onUploadProgress: (progress) => {
          setUploadProgress(progress);
        },
      });

      alert("Account created successfully!");

    } catch (err) {

      const errorMessage = err.message || "Unable to create account. Please try again.";
      setError(errorMessage);
      alert("Error: " + errorMessage);
      setUploadProgress(0);

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="phone-app-outer">
      <div className="phone-app-shell bg-[#061120]">
        <div className="absolute inset-0 bg-[#061120]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.15),transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.12),transparent_26%)]" />

        <div className="relative z-10 flex h-full flex-col justify-between gap-5 overflow-y-auto px-6 py-8 text-white">
          <div className="flex items-center justify-between">
            <button onClick={step === 1 ? onBackToSignIn : () => setStep(step - 1)} className="text-slate-400 hover:text-white transition">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1.5 w-6 rounded-full transition ${s <= step ? "bg-cyan-400" : "bg-white/10"}`} />
              ))}
            </div>
            <div className="w-5" />
          </div>

          <div>
            {error && (
              <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">
                {error}
              </div>
            )}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold">Basic info</h2>
                  <p className="mt-1 text-sm text-slate-400">Help us identify you</p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Full name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      className="w-full rounded-3xl bg-slate-900/80 pl-11 pr-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none transition focus:ring-cyan-400/30"
                      placeholder="Full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="w-full rounded-3xl bg-slate-900/80 pl-11 pr-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none transition focus:ring-cyan-400/30"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full rounded-3xl bg-slate-900/80 pl-11 pr-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none transition focus:ring-cyan-400/30"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="w-full rounded-3xl bg-slate-900/80 pl-11 pr-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none transition focus:ring-cyan-400/30"
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Emergency contact</label>
                  <div className="relative">
                    <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="tel"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                      className="w-full rounded-3xl bg-slate-900/80 pl-11 pr-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none transition focus:ring-cyan-400/30"
                      placeholder="Family/trusted contact"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold">Health info</h2>
                  <p className="mt-1 text-sm text-slate-400">Helps responders assist you better</p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Blood group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => handleInputChange("bloodGroup", e.target.value)}
                    className="w-full rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none transition focus:ring-cyan-400/30"
                  >
                    <option value="">Select blood group</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Medical info (optional)</label>
                  <textarea
                    value={formData.medicalInfo}
                    onChange={(e) => handleInputChange("medicalInfo", e.target.value)}
                    className="w-full rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none transition focus:ring-cyan-400/30"
                    placeholder="Allergies, medications, conditions..."
                    rows={4}
                  />
                </div>

                <label className="flex items-center gap-3 rounded-3xl bg-slate-900/80 p-4 ring-1 ring-white/10 cursor-pointer hover:bg-slate-900 transition">
                  <input
                    type="checkbox"
                    checked={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.checked)}
                    className="h-5 w-5 rounded-md border-white/20 bg-slate-800 text-cyan-500 accent-cyan-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Allow location access</p>
                    <p className="text-xs text-slate-400">Required for emergency protection</p>
                  </div>
                </label>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold">Your role</h2>
                  <p className="mt-1 text-sm text-slate-400">Choose how you use RoadSOS</p>
                </div>

                <div className="space-y-3">
                  {[
                    { value: "user", label: "Normal User", desc: "Protection & monitoring" },
                    { value: "helper", label: "Verified Helper", desc: "Help nearby emergencies" },
                    { value: "police", label: "Police", desc: "Dispatch responder" },
                    { value: "hospital", label: "Hospital", desc: "Medical coordination" },
                    { value: "fire", label: "Fire Rescue", desc: "Emergency response" },
                  ].map((role) => (
                    <button
                      key={role.value}
                      onClick={() => handleInputChange("role", role.value)}
                      className={`w-full rounded-3xl p-4 text-left transition ring-1 ${
                        formData.role === role.value
                          ? "bg-cyan-500/10 ring-cyan-400/50"
                          : "bg-slate-900/80 ring-white/10 hover:bg-slate-900/95"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">{role.label}</p>
                          <p className="text-xs text-slate-400">{role.desc}</p>
                        </div>
                        {formData.role === role.value && <Check className="h-5 w-5 text-cyan-400" />}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="space-y-3 rounded-3xl bg-slate-950/50 p-4 ring-1 ring-white/10">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-cyan-300" />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Verification details</p>
                  </div>

                  {formData.role === "helper" && (
                    <>
                      <input className="w-full rounded-2xl bg-slate-900/80 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-cyan-400/30" placeholder="Government ID" value={formData.governmentId} onChange={(e) => handleInputChange("governmentId", e.target.value)} />
                      <input className="w-full rounded-2xl bg-slate-900/80 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-cyan-400/30" placeholder="City" value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} />
                      <label className="block rounded-2xl bg-slate-900/80 px-4 py-3 text-sm text-slate-300 ring-1 ring-white/10">
                        {formData.selfieFile?.name || "Upload selfie/photo"}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange("selfieFile", e.target.files?.[0])} />
                      </label>
                      {formData.selfiePreview && (
                        <img src={formData.selfiePreview} alt="Selfie preview" className="h-20 w-20 rounded-2xl object-cover ring-1 ring-cyan-400/40" />
                      )}
                    </>
                  )}

                  {formData.role === "police" && (
                    <>
                      <input className="w-full rounded-2xl bg-slate-900/80 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-cyan-400/30" placeholder="Badge ID" value={formData.badgeId} onChange={(e) => handleInputChange("badgeId", e.target.value)} />
                      <input className="w-full rounded-2xl bg-slate-900/80 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-cyan-400/30" placeholder="Station name" value={formData.stationName} onChange={(e) => handleInputChange("stationName", e.target.value)} />
                      <input className="w-full rounded-2xl bg-slate-900/80 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-cyan-400/30" placeholder="Official email" value={formData.officialEmail} onChange={(e) => handleInputChange("officialEmail", e.target.value)} />
                    </>
                  )}

                  {formData.role === "hospital" && (
                    <>
                      <input className="w-full rounded-2xl bg-slate-900/80 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-cyan-400/30" placeholder="Hospital name" value={formData.hospitalName} onChange={(e) => handleInputChange("hospitalName", e.target.value)} />
                      <input className="w-full rounded-2xl bg-slate-900/80 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-cyan-400/30" placeholder="Registration ID" value={formData.registrationId} onChange={(e) => handleInputChange("registrationId", e.target.value)} />
                    </>
                  )}

                  {formData.role === "fire" && (
                    <>
                      <input className="w-full rounded-2xl bg-slate-900/80 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-cyan-400/30" placeholder="Station name" value={formData.stationName} onChange={(e) => handleInputChange("stationName", e.target.value)} />
                      <input className="w-full rounded-2xl bg-slate-900/80 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-cyan-400/30" placeholder="Officer ID" value={formData.officerId} onChange={(e) => handleInputChange("officerId", e.target.value)} />
                    </>
                  )}

                  {formData.role === "user" && (
                    <p className="text-xs text-slate-400">Normal users require a completed profile and emergency contact before activation.</p>
                  )}

                  {formData.role !== "user" && (
                    <label className="block rounded-2xl bg-slate-900/80 px-4 py-3 text-sm text-slate-300 ring-1 ring-white/10">
                      {formData.idProofName || "Upload verification document"}
                      <input type="file" className="hidden" onChange={(e) => handleFileChange("idProofFile", e.target.files?.[0])} />
                    </label>
                  )}

                  {uploadProgress === 100 && (
                    <p className="text-xs font-semibold text-cyan-300">Upload complete</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              handleNext();
            }}
            disabled={isLoading}
            className="w-full rounded-3xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(14,165,233,0.2)] transition hover:bg-cyan-400 disabled:opacity-50"
          >
            {isLoading && uploadProgress > 0 && uploadProgress < 100 
              ? `Uploading ${uploadProgress}%`
              : isLoading
              ? "Creating account..."
              : step === 3 
              ? "Create account"
              : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
