import React, { ReactElement, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useFetch from "../../../../../hooks/useFetch";

import { User } from "../../../../../types";
import UsersTable from "../components/UsersTable";

function ListUsers(): ReactElement {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const [query, setQuery] = useState("");

  // This will fetch the users and add them to state
  const { data } = useFetch<User[]>("users");

  useEffect(() => {
    if (data) {
      setUsers(data);
      setFilteredUsers(data);
    }
  }, [data]);

  // handleSearch is called when the search bar updates and updates the filteredUsers state. If the query is empty,
  // all users are returned.
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();

    setQuery(e.target.value);

    if (!e.target.value) {
      setFilteredUsers(users);
      return;
    }

    setFilteredUsers(
      users.filter((u) =>
        RegExp(e.target.value, "i").test(`${u.firstName} ${u.lastName}`),
      ),
    );
  };

  return (
    <div id="members">
      <h1>Members ({filteredUsers.length})</h1>

      <div className="row">
        <div className="col-lg-6 col-md-6 col-sm-6">
          <div className="btn-group">
            <Link to={`new`} className="btn btn-primary btn-responsive">
              Add Members
            </Link>

            <form className="form-inline">
              <div className="form-group">
                <input type="hidden" className="form-control"></input>
              </div>
            </form>
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6">
          <div className="input-group">
            <span className="input-group-btn">
              <button type="button" className="btn btn-default">
                Search
              </button>
            </span>

            <input
              type="text"
              placeholder="Search..."
              className="form-control search"
              value={query}
              onChange={(e) => handleSearch(e)}
            ></input>
          </div>
        </div>
      </div>

      <UsersTable users={filteredUsers} />
    </div>
  );
}

export default ListUsers;
