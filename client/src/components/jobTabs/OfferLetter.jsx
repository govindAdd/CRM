import React, { useEffect, useState } from "react";
import axios from "axios";

function OfferLetter({ candidate }) {
  const [companyInfo, setCompanyInfo] = useState(null);

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

  // Candidate defaults
  const {
    fullName = "Govind Ghosh",
    salutation = "Mr.",
    candidateAddressLines = [
      "159, Harinagar Colony, Rajpur,",
      "Vrindavan bangar, Mathura,",
      "Uttar Pradesh - 281121",
    ],
    position = "WordPress Web Developer",
    salary = "Rs. 2,16,000/- P.A.",
    manager = "Miss Priya Sharma",
    joiningDate = "19th June 2025",
    probation = "6 Months",
    issueDate = "June 18th 2025",
    hrTitle = "HR",
    hrName = "Namrita Chaturvedi",
    responsibilities = [
      "Design, develop, and maintain responsive websites using WordPress CMS.",
      "Create and customize WordPress themes and plugins as per project requirements.",
      "Integrate third-party tools and plugins seamlessly.",
      "Optimize website speed, performance, and security using best practices.",
      "Format and upload content, images, and multimedia for a user-friendly experience.",
      "Ensure cross-browser and device compatibility for all websites.",
      "Troubleshoot technical issues related to layout, functionality, and plugin conflicts.",
      "Perform regular updates of WordPress core, themes, and plugins.",
      "Implement basic on-page SEO elements like meta tags, alt text, and heading structures.",
      "Conduct thorough testing to ensure websites meet quality and performance standards.",
      "Collaborate with design, content, and marketing teams to achieve project goals.",
      "Maintain clear documentation of development processes and updates.",
    ],
    requiredDocuments = [
      "Academic Certificate",
      "Aadhar Card and PAN Card",
      "2 passport size photographs",
      "Original Acknowledgment of your resignation letter (to previous employment) Relieving Letter from previous employer (Original)",
      "Last 3 month salary slips",
      "Cancel Cheque/Bank Passbook",
    ],
  } = candidate || {};

  return (
    <div className="flex justify-center py-10 bg-gray-100 min-h-screen">
      <div className="page w-full max-w-4xl bg-white shadow-2xl p-10 rounded-xl text-gray-900 leading-relaxed">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          {/* Left: Logo + ADD GOD */}
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
            <div className="flex flex-col leading-tight font-god">
              <span className="text-3xl font-bold" style={{ color: "#FF9500" }}>
                ADD GOD
              </span>
              <span className="text-xs text-gray-600">
                Your AD and Tech Partner
              </span>
            </div>
          </div>
          {/* Right: Company Address in 2 lines */}
          <div className="text-right flex flex-col justify-end w-1/3">
            <p className="text-sm">{companyAddress[0]}</p>
            <p className="text-sm">{companyAddress[1]}</p>
          </div>
        </div>
        <div className="h-1 bg-[#FF9500]" />

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
            {salutation} {fullName}
          </p>
          {candidateAddressLines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        {/* Greeting */}
        <p className="mb-6">Dear {fullName.split(" ")[0]},</p>

        {/* Intro */}
        <p className="mb-6">
          Congratulations! We are pleased to offer you the position of{" "}
          <span className="font-semibold">{position}</span> at{" "}
          <span className="font-semibold">{companyName}</span> with an annual
          cost of <span className="font-semibold">{salary}</span>. This position
          reports to Manager <span className="font-semibold">{manager}</span>.
        </p>

        {/* Responsibilities */}
        <p className="mb-3">
          Your responsibilities will include, but are not limited to:
        </p>
        <ul className="list-disc list-inside space-y-1 mb-6">
          {responsibilities.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>

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
          <ul className="list-disc list-inside space-y-1">
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
          <p>{companyData?.COPYRIGHT || "© 2023 All Rights Reserved"}</p>
        </div>
      </div>
    </div>
  );
}

export default OfferLetter;
