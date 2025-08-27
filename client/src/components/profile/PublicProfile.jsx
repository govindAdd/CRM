import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import { ArrowLeft, Copy, Download, QrCode } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";
import { QRCodeSVG } from "qrcode.react";
import api from "../../services/axios";
import {
  Mail,
  Phone,
  Building2,
  BadgeInfo,
  Globe,
  Users,
  Calendar,
  Sparkles,
} from "lucide-react";

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/70 dark:bg-gray-800/70 hover:bg-opacity-90 transition-all backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-md">
    <div className="p-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-xl shrink-0 shadow-sm">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 break-all">
        {value || "N/A"}
      </p>
    </div>
  </div>
);

const ShareLink = ({ fullName }) => {
  const { href } = window.location;
  const [isOpen, setIsOpen] = useState(false);
  const qrRef = useRef();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(href);
    toast.success("Link copied to clipboard");
  };

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return toast.error("QR download failed");

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const safeName = (fullName || "profile").toLowerCase().replace(/\s+/g, "-");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeName}-qr.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={href}
          className="w-full text-sm px-3 py-2 rounded border bg-white dark:bg-gray-700 shadow-sm text-gray-700 dark:text-gray-100"
        />
        <button
          onClick={handleCopy}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
        >
          <Copy size={18} />
        </button>
        <button
          onClick={() => setIsOpen(true)}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
        >
          <QrCode size={18} />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative w-[300px] text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-3 text-gray-500 dark:text-gray-300 hover:text-red-600"
            >
              ✕
            </button>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Share Profile QR
            </h2>
            <div ref={qrRef} className="flex justify-center">
              <QRCodeSVG
                value={href}
                size={180}
                bgColor="#ffffff"
                fgColor="#1e40af"
                includeMargin
              />
            </div>
            <button
              onClick={handleDownloadQR}
              className="mt-4 inline-flex items-center gap-2 text-white bg-indigo-600 px-4 py-1.5 rounded-md text-sm hover:bg-indigo-700 transition"
            >
              <Download size={14} />
              Download SVG
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const BackToDirectoryButton = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/")}
      className="fixed bottom-6 left-6 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-700 shadow-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-all px-4 py-2 rounded-full flex items-center gap-2 z-50"
    >
      <ArrowLeft size={16} />
      <span className="text-sm font-medium">Back to Directory</span>
    </button>
  );
};

const PublicProfilePage = () => {
  const { username } = useParams();
  const [employee, setEmployee] = useState(null);
  const [hr, setHr] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const profileRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const employeeRes = await api.get(`/users/user/${username}`);
        setEmployee(employeeRes.data?.data?.employee);
        setHr(employeeRes.data?.data?.hr);

        const companyRes = await api.get("/info");
        setCompany(companyRes.data.data);
      } catch (err) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [username]);

  const handleDownloadPDF = () => {
    if (!profileRef.current) {
      toast.error("PDF generation failed");
      return;
    }

    setTimeout(() => {
      html2pdf()
        .set({
          margin: 0.5,
          filename: `${employee?.fullName || "profile"}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .from(profileRef.current)
        .save();
    }, 100);
  };

  return (
    <section className="min-h-screen px-4 py-12 bg-gradient-to-b from-slate-50 dark:from-gray-900 to-slate-100 dark:to-gray-800 relative transition-colors">
      <BackToDirectoryButton />

      {loading ? (
        <div className="max-w-4xl mx-auto bg-white/80 dark:bg-gray-800/80 p-8 rounded-3xl shadow-lg">
          <Skeleton height={120} width={120} circle />
          <Skeleton height={30} width={200} className="mt-4" />
          <Skeleton count={4} height={20} className="mt-2" />
        </div>
      ) : (
        <div
          className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-gray-700 transition-colors"
          ref={profileRef}
        >
          {/* PDF Button */}
          <div className="w-full flex justify-end mb-4">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 text-white bg-indigo-600 px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row items-center gap-8 pt-4 pb-6">
            <img
              src={employee.avatar}
              alt={employee.fullName}
              className="w-32 h-32 rounded-full border-4 border-indigo-500 dark:border-indigo-400 object-cover shadow-lg"
            />
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">{employee.fullName}</h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{employee.designation}</p>
              <span className="mt-3 inline-block bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
                {employee.role}
              </span>
            </div>
          </div>

          {/* Employee Info */}
          <div className="py-6 grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-gray-200 dark:border-gray-700">
            <InfoItem icon={Mail} label="Email" value={employee.email} />
            <InfoItem icon={Phone} label="Phone" value={employee.phone} />
            <InfoItem icon={Building2} label="Department ID" value={employee.department} />
            <InfoItem icon={BadgeInfo} label="Role" value={employee.role} />
          </div>

          {/* HR Contact */}
          {hr && (
            <div className="py-6 border-t border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 px-4 md:px-8 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">HR Contact</h3>
              <div className="flex items-center gap-4">
                <img
                  src={hr.avatar}
                  alt={hr.fullName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-400 dark:ring-indigo-600 shadow-md"
                />
                <div>
                  <p className="text-gray-800 dark:text-gray-100 font-medium">{hr.fullName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{hr.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Company Information */}
          {company && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row gap-6 items-center mb-6">
                <img 
                  src={company.LOGO_URL} 
                  alt={company.NAME} 
                  className="w-24 h-24 object-contain"
                />
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{company.NAME}</h2>
                  <p className="text-indigo-600 dark:text-indigo-400 font-medium">{company.TAGLINE}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{company.DESCRIPTION}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-gray-900 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Sparkles size={18} />
                    Core Services
                  </h3>
                  <ul className="space-y-2">
                    {company.CORE_SERVICES.map((service, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-indigo-500 dark:text-indigo-400 mr-2">•</span>
                        <span className="text-gray-600 dark:text-gray-300">{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-slate-50 dark:bg-gray-900 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Users size={18} />
                    Why Choose Us
                  </h3>
                  <ul className="space-y-2">
                    {company.WHY_CHOOSE_US.map((reason, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-indigo-500 dark:text-indigo-400 mr-2">•</span>
                        <span className="text-gray-600 dark:text-gray-300">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoItem 
                  icon={Calendar} 
                  label="Established" 
                  value={company.ESTABLISHED_YEAR} 
                />
                <InfoItem 
                  icon={Users} 
                  label="Employees" 
                  value={company.EMPLOYEE_STRENGTH} 
                />
                <InfoItem 
                  icon={Globe} 
                  label="Industry" 
                  value={company.INDUSTRY} 
                />
              </div>
              
              <div className="mt-6 bg-indigo-50 dark:bg-indigo-900 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Email:</span> {company.CONTACT.EMAIL}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Phone:</span> {company.CONTACT.PHONE}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Website:</span>{" "}
                    <a 
                      href={company.CONTACT.WEBSITE} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {company.CONTACT.WEBSITE}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Share */}
          <div className="mt-8">
            <ShareLink fullName={employee.fullName} />
          </div>
        </div>
      )}
    </section>
  );
};

export default PublicProfilePage;
