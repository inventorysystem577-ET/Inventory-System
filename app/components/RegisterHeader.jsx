export default function RegisterHeader({
  title = "Fill Your Registration",
  subtitle = "Fill your registration details and proceed to page.",
}) {
  return (
    <div className="text-center mb-8">
      <h2
        className="text-2xl font-bold 
        text-white md:text-gray-800"
      >
        {title}
      </h2>
      <p
        className="text-sm 
        text-gray-300 md:text-gray-600 mt-1"
      >
        {subtitle}
      </p>
    </div>
  );
}
