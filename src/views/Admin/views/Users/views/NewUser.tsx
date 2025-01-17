import React, { ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";

import { faculties } from "../../../../../constants";
import sendAPIRequest from "../../../../../shared/utils/sendAPIRequest";

function NewUser(): ReactElement {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [faculty, setFaculty] = useState("");
  const [questId, setQuestId] = useState("");
  const [id, setId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    sendAPIRequest("users", "POST", {
      id: Number(id),
      firstName,
      lastName,
      email,
      faculty,
      questId,
    }).then(({ status }) => {
      if (status === 201) {
        return navigate("../");
      }

      if (status === 500) {
        setErrorMessage("This user already exists.");
      }
    });
  };

  return (
    <div className="row">
      <div className="col-md-3"></div>
      <div className="col-md-6">
        {errorMessage && (
          <div role="alert" className="alert alert-danger">
            <span>{errorMessage}</span>
          </div>
        )}
        <h1 className="center">Sign Up</h1>
        <div className="mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="first_name">First Name:</label>
              <input
                type="text"
                placeholder="First name"
                name="first_name"
                className="form-control"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              ></input>
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last Name:</label>
              <input
                type="text"
                placeholder="Last name"
                name="last_name"
                className="form-control"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              ></input>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="text"
                placeholder="Email"
                name="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              ></input>
            </div>

            <div className="form-group">
              <label htmlFor="faculty">Faculty:</label>
              <select
                name="faculty"
                className="form-control"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
              >
                <option>Choose one</option>
                {faculties.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="quest_id">Quest ID:</label>
              <input
                type="text"
                placeholder="Quest ID"
                name="quest_id"
                className="form-control"
                value={questId}
                onChange={(e) => setQuestId(e.target.value)}
              ></input>
            </div>

            <div className="form-group">
              <label htmlFor="id">Student Number:</label>
              <input
                type="text"
                placeholder="Student Number"
                name="id"
                className="form-control"
                value={id}
                onChange={(e) => setId(e.target.value)}
              ></input>
            </div>

            <div className="row">
              <div className="mx-auto">
                <button
                  type="submit"
                  value="Submit"
                  className="btn btn-success btn-responsive"
                >
                  Submit
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="col-md-3"></div>
    </div>
  );
}

export default NewUser;
