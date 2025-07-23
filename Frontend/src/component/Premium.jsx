import React from "react";
import axios from "axios";
import { BaseUrl } from "../utils/constance";

const Premium = () => {
  const handleBuyClick = async (plan) => {
    const order = await axios.post(`${BaseUrl}/payment/create`, {
      membershipType : plan,
  }, {
      withCredentials: true,
    });

  };
  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="container px-6 py-8 mx-auto">
        <div className="xl:flex xl:items-center xl:-mx-8">
          {/* Left Section */}
          <div className="flex flex-col items-center xl:items-start xl:mx-8">
            <h1 className="text-2xl font-medium text-gray-800 capitalize lg:text-3xl dark:text-white">
              Our Pricing Plan
            </h1>

            <div className="mt-4">
              <span className="inline-block w-40 h-1 bg-blue-500 rounded-full" />
              <span className="inline-block w-3 h-1 mx-1 bg-blue-500 rounded-full" />
              <span className="inline-block w-1 h-1 bg-blue-500 rounded-full" />
            </div>

            <p className="mt-4 font-medium text-gray-500 dark:text-gray-300">
              You can get All Access by selecting your plan!
            </p>

            <a
              href="#"
              className="flex items-center mt-4 text-sm text-gray-700 capitalize dark:text-blue-400 hover:underline hover:text-blue-600 dark:hover:text-blue-500"
            >
              <span>Read more</span>
              <svg
                className="w-4 h-4 ml-1 rtl:-scale-x-100"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>

          {/* Pricing Cards */}
          <div className="flex-1 xl:mx-8">
            <div className="mt-8 md:flex md:space-x-8 xl:mt-0 space-y-8 md:space-y-0">
              {/* Essential Plan */}
              <PricingCard
                title="Essential"
                description="Perfect for individuals starting out."
                price="$3.00"
                duration="/Month"
                note="Yearly payment"
                features={[
                  "All limited links",
                  "Own analytics platform",
                  "Chat support",
                  "Optimize hashtags",
                ]}
                excluded={["Mobile app", "Unlimited users"]}
                onStartClick={handleBuyClick}
              />

              {/* Premium Plan */}
              <PricingCard
                title="Premium"
                description="One time payment for lifetime benefits."
                price="$50.00"
                duration="/Lifetime"
                note="One time payment"
                features={[
                  "All limited links",
                  "Own analytics platform",
                  "Chat support",
                  "Optimize hashtags",
                  "Mobile app",
                  "Unlimited users",
                ]}
                onStartClick={handleBuyClick}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable pricing card
const PricingCard = ({
  title,
  description,
  price,
  duration,
  note,
  features,
  excluded = [],
  onStartClick,
}) => (
  <div className="max-w-sm mx-auto border rounded-lg dark:border-gray-700 md:mx-0">
    <div className="p-6">
      <h2 className="text-xl font-medium text-gray-700 capitalize lg:text-2xl dark:text-white">
        {title}
      </h2>

      <p className="mt-4 text-gray-500 dark:text-gray-300">{description}</p>

      <h3 className="mt-4 text-2xl font-semibold text-gray-700 sm:text-3xl dark:text-gray-300">
        {price} <span className="text-base font-medium">{duration}</span>
      </h3>

      <p className="mt-1 text-gray-500 dark:text-gray-300">{note}</p>

      <button
        onClick={() => onStartClick(title)}
        className="w-full px-4 py-2 mt-6 tracking-wide text-white transition-colors duration-300 transform bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        Start Now
      </button>
    </div>

    <hr className="border-gray-200 dark:border-gray-700" />

    <div className="p-6">
      <h4 className="text-lg font-medium text-gray-700 capitalize lg:text-xl dark:text-white">
        What’s included:
      </h4>

      <div className="mt-6 space-y-4">
        {features.map((feature, index) => (
          <FeatureItem key={index} text={feature} isIncluded />
        ))}
        {excluded.map((feature, index) => (
          <FeatureItem key={`ex-${index}`} text={feature} isIncluded={false} />
        ))}
      </div>
    </div>
  </div>
);

// Reusable feature item
const FeatureItem = ({ text, isIncluded }) => (
  <div className="flex items-center">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`w-5 h-5 ${isIncluded ? "text-blue-500" : "text-red-400"}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      {isIncluded ? (
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      ) : (
        <path
          fillRule="evenodd"
          d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
          clipRule="evenodd"
        />
      )}
    </svg>
    <span className="mx-4 text-gray-700 dark:text-gray-300">{text}</span>
  </div>
);
}

export default Premium;
