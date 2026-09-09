import { Link } from "react-router-dom";

function HomeCard({ title, description, path }) {
  return (
    <Link
      to={path}
      className="
      bg-white
      rounded-2xl
      p-8
      shadow-md
      hover:shadow-xl
      hover:-translate-y-1
      transition
      duration-300
      "
    >
      <h2 className="text-2xl font-bold mb-3">
        {title}
      </h2>

      <p className="text-gray-600 leading-7">
        {description}
      </p>
    </Link>
  );
}

export default HomeCard;