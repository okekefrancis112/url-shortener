const LinkedInIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 34 34"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* White rounded background */}
    <rect width="34" height="34" rx="6" fill="white" />

    {/* LinkedIn blue square */}
    <rect x="5" y="5" width="24" height="24" rx="4" fill="#0A66C2" />

    {/* "in" logo */}
    <path
      fill="white"
      d="M12.44 14.28H9.56V24.5h2.88V14.28zM11 9.5c-.92 0-1.66.74-1.66 1.66 0 .92.74 1.66 1.66 1.66s1.66-.74 1.66-1.66c0-.92-.74-1.66-1.66-1.66zM24.44 24.5h2.88v-5.65c0-3.02-1.61-4.43-3.76-4.43-1.74 0-2.52.96-2.95 1.63v-1.39h-2.88c.04.92 0 9.84 0 9.84h2.88v-5.5c0-.29.02-.59.11-.8.24-.59.78-1.2 1.69-1.2 1.19 0 1.67.9 1.67 2.22v5.28z"
    />
  </svg>
);

export default LinkedInIcon;
