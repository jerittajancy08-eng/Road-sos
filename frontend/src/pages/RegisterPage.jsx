import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { registerUser } from "../services/authService.js";
import {
  User,
  Mail,
  Lock,
  Phone,
  HeartPulse,
  Shield,
} from "lucide-react";
export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    bloodGroup: "",
    emergencyContact: "",
    medicalNotes: "",
  });
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async () => {
    try {
      await registerUser(
        formData.email,
        formData.password,
        {
          fullName: formData.fullName,
          phone: formData.phone,
          bloodGroup: formData.bloodGroup,
          emergencyContact: formData.emergencyContact,
          medicalNotes: formData.medicalNotes,
        }
      );

      alert("Registration Successful");
      navigate("/", { replace: true });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex justify-center items-center p-6">
      <div className="bg-[#0f172a] p-8 rounded-3xl w-full max-w-md border border-slate-800">

        <div className="flex items-center gap-3 mb-6">
          <Shield className="text-red-500" size={32} />
          <h1 className="text-3xl font-bold">
            RoadSOS
          </h1>
        </div>

        <p className="text-slate-400 mb-6">
          Emergency Response Registration
        </p>

        <div className="space-y-4">

          <div className="flex items-center bg-[#111827] rounded-xl px-4">
            <User className="text-slate-400" />
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              onChange={handleChange}
              className="bg-transparent p-4 w-full outline-none"
            />
          </div>

          <div className="flex items-center bg-[#111827] rounded-xl px-4">
            <Mail className="text-slate-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              className="bg-transparent p-4 w-full outline-none"
            />
          </div>

          <div className="flex items-center bg-[#111827] rounded-xl px-4">
            <Lock className="text-slate-400" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              className="bg-transparent p-4 w-full outline-none"
            />
          </div>

          <div className="flex items-center bg-[#111827] rounded-xl px-4">
            <Phone className="text-slate-400" />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              onChange={handleChange}
              className="bg-transparent p-4 w-full outline-none"
            />
          </div>

          <div className="flex items-center bg-[#111827] rounded-xl px-4">
            <HeartPulse className="text-slate-400" />
            <input
              type="text"
              name="bloodGroup"
              placeholder="Blood Group"
              onChange={handleChange}
              className="bg-transparent p-4 w-full outline-none"
            />
          </div>

          <input
            type="text"
            name="emergencyContact"
            placeholder="Emergency Contact Number"
            onChange={handleChange}
            className="bg-[#111827] p-4 rounded-xl w-full outline-none"
          />

          <textarea
            name="medicalNotes"
            placeholder="Medical Notes"
            onChange={handleChange}
            className="bg-[#111827] p-4 rounded-xl w-full outline-none"
          />

          <button
            onClick={handleRegister}
            className="w-full bg-red-600 hover:bg-red-700 p-4 rounded-xl font-bold transition"
          >
            Create Account
          </button>

        </div>
      </div>
    </div>
  );
}
