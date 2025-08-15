import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { type CvData } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function serializeCvData(data: CvData): string {
  let content = `CV of ${data.personalDetails.name}\n\n`;

  content += `--- Personal Details ---\n`;
  content += `Name: ${data.personalDetails.name}\n`;
  content += `Job Title: ${data.personalDetails.jobTitle}\n`;
  content += `Email: ${data.personalDetails.email}\n`;
  content += `Phone: ${data.personalDetails.phone}\n`;
  content += `Address: ${data.personalDetails.address}\n`;
  content += `LinkedIn: ${data.personalDetails.linkedin}\n`;
  content += `Website: ${data.personalDetails.website}\n\n`;
  if (data.personalDetails.photo) {
    content += `The user has provided a photo.\n\n`;
  }

  content += `--- Summary ---\n${data.personalDetails.summary}\n\n`;

  if (data.workExperience.length > 0) {
    content += `--- Work Experience ---\n`;
    data.workExperience.forEach(exp => {
      content += `Title: ${exp.jobTitle} at ${exp.company}\n`;
      content += `Location: ${exp.location}\n`;
      content += `Dates: ${exp.startDate} - ${exp.endDate}\n`;
      content += `Description:\n${exp.description}\n\n`;
    });
  }

  if (data.education.length > 0) {
    content += `--- Education ---\n`;
    data.education.forEach(edu => {
      content += `Degree: ${edu.degree}\n`;
      content += `Institution: ${edu.institution}, ${edu.location}\n`;
      content += `Dates: ${edu.startDate} - ${edu.endDate}\n`;
      content += `Description: ${edu.description}\n\n`;
    });
  }

  if (data.skills.length > 0) {
    content += `--- Skills ---\n`;
    content += data.skills.map(skill => skill.name).join(', ') + '\n';
  }

  return content;
}
