import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import { asBlob } from "html-docx-ts";
import inlineCss from "inline-css";

const sampleOffer = {
  user: {
    fullName: "Priya Sharma",
    designation: "Frontend Developer",
    salary: {
      amount: 75000,
      currency: "INR",
      period: "month",
    },
    responsibilities: [
      '["Developing user interfaces", "Implementing responsive designs", "Collaborating with UX team", "Code reviews"]',
    ],
    keySkills: ['["React", "JavaScript", "HTML/CSS", "TypeScript"]'],
    joinDate: "2024-06-15T00:00:00.000Z",
    location: "Mumbai, Maharashtra",
    hrName: "Rajesh Kumar",
  },
};

function Sample({ off = sampleOffer }) {
  const [companyInfo, setCompanyInfo] = useState(null);
  const offerLetterRef = useRef(null);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/v1/info`
        );
        setCompanyInfo(res.data);
      } catch (error) {
        console.error("Error fetching company info:", error);
      }
    };
    fetchCompanyInfo();
  }, []);

  // ✅ Company data
  const companyData = companyInfo?.data || {};
  const companyName = companyData?.LEGAL_NAME || "ADD-GOD Digital Pvt. Ltd.";
  const logoURL = companyData?.LOGO_URL || null;
  const contact = companyData?.CONTACT || {};
  const headquarters = companyData?.HEADQUARTERS || {};

  const companyAddress = companyData?.ADDRESS
    ? companyData.ADDRESS.split("\n")
    : [
        companyData?.ADDRESS_LINE1 || "",
        companyData?.ADDRESS_LINE2 || "",
        `${headquarters.CITY || ""}, ${headquarters.STATE || ""} ${
          headquarters.POSTAL_CODE || ""
        }`,
        headquarters.COUNTRY || "",
      ].filter((line) => line.trim());

  // ✅ Salary safe handling
  const salaryData = off?.user?.salary || null;
  const salary = salaryData
    ? `${salaryData.amount} ${salaryData.currency} / ${salaryData.period}`
    : "As per company policy";

  // ✅ Parse JSON arrays from DB
  const responsibilities =
    Array.isArray(off?.user?.responsibilities) &&
    off?.user?.responsibilities.length
      ? JSON.parse(off?.user?.responsibilities[0])
      : [];

  const keySkills =
    Array.isArray(off?.user?.keySkills) && off.user?.keySkills.length
      ? JSON.parse(off?.user?.keySkills[0])
      : [];

  // ✅ Joining details
  const joiningDate = off?.user?.joinDate
    ? new Date(off.user?.joinDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "To be decided";

  // Defaults
  const probation = "6 months";
  const manager = "HR Manager";
  const salutation = "Ms."; // TODO: dynamic based on gender/title
  const candidateAddressLines = [off?.user?.location || ""];

  // ✅ HR details
  const hrName = off?.user?.hrName || "HR Department";
  const hrTitle = "HR Manager";
  const requiredDocuments = [
    "Academic Certificate",
    "Aadhar Card and PAN Card",
    "2 passport size photographs",
    "Original Acknowledgment of your resignation letter (previous employment)",
    "Relieving Letter from previous employer (Original)",
    "Last 3 month salary slips",
    "Cancel Cheque/Bank Passbook",
  ];

  // ✅ Generate DOCX with inline Tailwind styles

  const generateDOCX = async (offerLetterRef) => {
    if (!offerLetterRef.current) return;

    // Full HTML (with Tailwind inline styling applied by inline-css)
    const rawHtml = `
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; font-size: 12pt; color: #333;">
    ${offerLetterRef.current.innerHTML}
  </body>
</html>
`;

    try {
      // 🔥 Inline Tailwind classes into <style>
      const inlinedHtml = await inlineCss(rawHtml, { url: "/" });

      // Convert to DOCX
      const docxBlob = await asBlob(inlinedHtml);

      // Save
      saveAs(docxBlob, "offer-letter.docx");
    } catch (err) {
      console.error("Error generating DOCX:", err);
    }
  };

  return (
    <div className="flex flex-col items-center py-10 bg-gray-100 min-h-screen">
      {/* Download Buttons */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => generateDOCX(offerLetterRef)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Download DOCX
        </button>
      </div>

      {/* Offer Letter Content */}
      <div
        ref={offerLetterRef}
        className="page w-full max-w-4xl bg-white shadow-2xl p-10 rounded-xl text-gray-900 leading-relaxed"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          {/* Left: Logo + Company */}
          <div className="flex items-center space-x-4">
            {logoURL && (
              <img
                src={logoURL}
                alt="Logo"
                className="h-16 w-16 object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
            <div className="flex flex-col leading-tight">
              <span className="text-3xl font-bold font-god tracking-wider text-[#ff9500]">
                ADD GOD
              </span>
              <span className="text-xs text-gray-600 font-god">
                Your AD and Tech Partner
              </span>
            </div>
          </div>
          {/* Right: Company Address */}
          <div className="text-right flex flex-col justify-end w-1/3">
            <p className="text-sm">{companyAddress[0]}</p>
            <p className="text-sm">{companyAddress[1]}</p>
          </div>
        </div>

        <div className="h-1 bg-[#FF9500]" />

        {/* Date */}
        <div className="text-right text-sm text-gray-600 mb-6">
          <p>
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Candidate Address */}
        <div className="mb-6 text-sm">
          <p>
            {salutation} {off?.user?.fullName}
          </p>
          {candidateAddressLines.map(
            (line, i) => line && <p key={i}>{line}</p>
          )}
        </div>

        {/* Greeting */}
        <p className="mb-6">Dear {off?.user?.fullName?.split(" ")[0]},</p>

        {/* Intro */}
        <p className="mb-6">
          Congratulations! We are pleased to offer you the position of{" "}
          <span className="font-semibold">{off?.user?.designation}</span> at{" "}
          <span className="font-semibold">{companyName}</span> with a salary of{" "}
          <span className="font-semibold">{salary}</span>. This position reports
          to Manager <span className="font-semibold">{manager}</span>.
        </p>

        {/* Responsibilities */}
        {responsibilities.length > 0 && (
          <>
            <p className="mb-3">
              Your responsibilities will include, but are not limited to:
            </p>
            <ul className="list-disc list-inside space-y-[0.3] mb-6">
              {responsibilities.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </>
        )}

        {/* Extra responsibility notes */}
        <p className="mb-6">
          These responsibilities are vital to your role and are designed to
          contribute to the overall success of the company while ensuring
          high-quality client management and engagement.
          <br />
          We value your flexibility, creativity, and willingness to contribute
          wherever possible to support the team and the organization's goals.
          While this list outlines the primary areas of responsibility, your
          role may evolve to encompass additional tasks based on company needs
          and your unique skill set.
        </p>

        <p className="mb-6">
          Also your daily responsibilities will serve as an indicator of your
          dedication and professionalism towards your work and the company. The
          evaluation of these responsibilities will form the basis of your
          monthly report and substantiate your compensation. The company
          reserves the right to deduct or hold salary in cases where targets are
          not met, as part of performance management measures.
        </p>

        <p className="mb-6">
          Please sign the enclosed copy of this letter and return it to me by{" "}
          <span className="font-semibold">{joiningDate}</span> to indicate your
          acceptance of this offer. If we find any candidate ineligible during
          training, the company reserves the full right to terminate his/her
          candidature from the company (whether in the middle of the month) and
          he/she will not be liable for any compensation/salary from the
          company.
        </p>

        <p className="mb-6">
          We are confident that your diverse capabilities will make a
          significant impact on our team, and we look forward to seeing the
          innovative solutions you bring to{" "}
          <span className="font-semibold">{companyName}</span>.
        </p>

        {/* Joining Details */}
        <div className="mb-6">
          <p>
            Your joining date is scheduled for{" "}
            <span className="font-semibold">{joiningDate}</span> with a
            probation period of{" "}
            <span className="font-semibold">{probation}</span>.
          </p>
        </div>

        {/* HR Signature */}
        <div className="mb-10">
          <p>Regards,</p>
          <p className="font-semibold">
            {hrName} | {hrTitle}
          </p>
          <p>{companyName}</p>
        </div>

        {/* Required Documents */}
        <div className="mt-10">
          <p className="font-semibold mb-2">
            Your formal appointment is subject to submission of the following
            documents:
          </p>
          <ul className="list-disc list-inside">
            {requiredDocuments.map((doc, i) => (
              <li key={i}>{doc}</li>
            ))}
          </ul>
        </div>

        {/* Contact Footer */}
        <div className="border-t mt-10 pt-4 text-sm text-gray-600 text-center">
          {contact.EMAIL && contact.PHONE ? (
            <p>
              {contact.EMAIL} | {contact.PHONE}
            </p>
          ) : (
            <p>{contact.EMAIL || contact.PHONE}</p>
          )}
          <p>{companyData?.COPYRIGHT || "© 2025 All Rights Reserved"}</p>
        </div>
      </div>
    </div>
  );
}

export default Sample;
