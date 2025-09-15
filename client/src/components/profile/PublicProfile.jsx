import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import { ArrowLeft, Copy, Download, QrCode } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';
import { toast } from "react-toastify";
import { QRCodeSVG } from "qrcode.react";
import api from "../../services/axios";
import { Mail, Phone, Building2, BadgeInfo } from "lucide-react";

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white bg-opacity-70 hover:bg-opacity-90 transition-all backdrop-blur-md border border-gray-200 shadow-md">
    <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl shrink-0 shadow-sm">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800 break-all">{value || "N/A"}</p>
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
          className="w-full text-sm px-3 py-2 rounded border bg-white shadow-sm text-gray-700"
        />
        <button onClick={handleCopy} className="text-indigo-600 hover:text-indigo-800">
          <Copy size={18} />
        </button>
        <button onClick={() => setIsOpen(true)} className="text-indigo-600 hover:text-indigo-800">
          <QrCode size={18} />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 relative w-[300px] text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-red-600"
            >
              ✕
            </button>
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Share Profile QR</h2>
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
      className="fixed bottom-6 left-6 bg-white text-indigo-600 border border-indigo-300 shadow-lg hover:bg-indigo-50 transition-all px-4 py-2 rounded-full flex items-center gap-2 z-50"
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
  const [loading, setLoading] = useState(true);
  const profileRef = useRef();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/user/${username}`);
        setEmployee(res.data?.data?.employee);
        setHr(res.data?.data?.hr);
      } catch (err) {
        toast.error("User not found");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const handleDownloadPDF = () => {
    if (!profileRef.current) {
      toast.error("PDF generation failed");
      return;
    }

    // Delay ensures DOM is rendered before snapshot
    setTimeout(() => {
      html2pdf()
        .set({
          margin: 0.5,
          filename: `${employee?.fullName || "profile"}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        })
        .from(profileRef.current)
        .save();
    }, 100);
  };

  return (
    <section className="min-h-screen px-4 py-12 bg-gradient-to-b from-slate-50 to-slate-100 relative">
      <BackToDirectoryButton />

      {loading ? (
        <div className="max-w-4xl mx-auto bg-white/80 p-8 rounded-3xl shadow-lg">
          <Skeleton height={120} width={120} circle />
          <Skeleton height={30} width={200} className="mt-4" />
          <Skeleton count={4} height={20} className="mt-2" />
        </div>
      ) : (
        <div
          className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
          ref={profileRef}
        >
          {/* PDF Button */}
          <div className="w-full flex justify-end mt-2 mb-2 md:mt-0 md:mb-0">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 text-white bg-indigo-600 px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row items-center gap-8 pt-4 pb-6 bg-gradient-to-br from-white to-slate-100">
            <img
              src={employee.avatar}
              alt={employee.fullName}
              className="w-32 h-32 rounded-full border-4 border-indigo-500 object-cover shadow-lg"
            />
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">{employee.fullName}</h1>
              <p className="text-gray-600 text-sm mt-1">{employee.designation}</p>
              <span className="mt-3 inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
                {employee.role}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="py-6 grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-gray-200">
            <InfoItem icon={Mail} label="Email" value={employee.email} />
            <InfoItem icon={Phone} label="Phone" value={employee.phone} />
            <InfoItem icon={Building2} label="Department ID" value={employee.department} />
            <InfoItem icon={BadgeInfo} label="Role" value={employee.role} />
          </div>

          {/* HR */}
          {hr && (
            <div className="py-6 border-t border-gray-100 bg-slate-50 px-4 md:px-8 rounded-b-3xl">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">HR Contact</h3>
              <div className="flex items-center gap-4">
                <img
                  src={hr.avatar}
                  alt={hr.fullName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-400 shadow-md"
                />
                <div>
                  <p className="text-gray-800 font-medium">{hr.fullName}</p>
                  <p className="text-sm text-gray-600">{hr.email}</p>
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
