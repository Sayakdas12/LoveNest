import React from 'react';

const Usercard = ({ user }) => {
    const {
        firstName,
        lastName,
        photoUrl,
        age,
        gender,
        about,
        skills
    } = user || {};

    if (!user) return <p>Loading user info...</p>;

    return (
        <div className="card bg-base-300 w-80 shadow-xl">
            <figure>
                <img
                    src={photoUrl || "https://bbdu.ac.in/wp-content/uploads/2021/11/dummy-image1.jpg"}
                    alt="User Photo"
                    className="w-full h-70 object-cover"
                />
            </figure>
            <div className="card-body">
                <h2 className="card-title">{firstName} {lastName}</h2>
                {age && gender && <p>{age}, {gender}</p>}
                {about && <p>{about}</p>}
                {/* Optional: show skills */}
                {skills && skills.length > 0 && (
                    {/* <div>
            <p className="font-bold mt-2">Skills:</p>
            <ul className="list-disc ml-5">
              {skills.map((skill, i) => (
                <li key={i}>{skill}</li>
              ))}
            </ul>
          </div> */}
                )}
                <div className="card-actions justify-center my-4">
                    <button className="btn btn-primary">Ignore</button>
                    <button className="btn btn-secondary">interested</button>

                </div>
            </div>
        </div>
    );
};

export default Usercard;
