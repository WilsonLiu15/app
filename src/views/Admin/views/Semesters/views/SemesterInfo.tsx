import React, { ReactElement, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useFetch from "../../../../../hooks/useFetch";
import sendAPIRequest from "../../../../../shared/utils/sendAPIRequest";

import { Membership, Semester, Transaction, User } from "../../../../../types";
import NewMembershipModal from "../components/NewMembershipModal";
import NewTransactionModal from "../components/NewTransactionModal";

import "./style.scss";

function SemesterInfo(): ReactElement {
  const { semesterId } = useParams<{ semesterId: string }>();

  const [semester, setSemester] = useState<Semester>();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [filteredMemberships, setFilteredMemberships] = useState<Membership[]>(
    [],
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [query, setQuery] = useState("");
  const handleSearch = (search: string): void => {
    setQuery(search);

    if (!search) {
      setFilteredMemberships(memberships);
      return;
    }

    setFilteredMemberships(
      memberships.filter((m) =>
        RegExp(search, "i").test(`${m.firstName} ${m.lastName}`),
      ),
    );
  };

  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);

  const { data: semesterData } = useFetch<Semester>(`semesters/${semesterId}`);
  const { data: membershipsData } = useFetch<Membership[]>(
    `memberships?semesterId=${semesterId}`,
  );
  const { data: transactionsData } = useFetch<Transaction[]>(
    `semesters/${semesterId}/transactions`,
  );

  useEffect(() => {
    if (semesterData && membershipsData && transactionsData) {
      setSemester(semesterData);

      setMemberships(membershipsData);
      setFilteredMemberships(membershipsData);

      setTransactions(transactionsData);
    }
  }, [semesterData, membershipsData, transactionsData]);

  const updateMembership = (
    membershipId: string,
    isPaid: boolean,
    isDiscounted: boolean,
  ) => {
    sendAPIRequest(`memberships/${membershipId}`, "PATCH", {
      paid: isPaid,
      discounted: isDiscounted,
    }).then(({ status }) => {
      if (status === 200) {
        setMemberships(
          memberships.map((m) => {
            if (m.id !== membershipId) return m;

            return {
              ...m,
              paid: isPaid,
              discounted: isDiscounted,
            };
          }),
        );

        setFilteredMemberships(
          filteredMemberships.map((m) => {
            if (m.id !== membershipId) return m;

            return {
              ...m,
              paid: isPaid,
              discounted: isDiscounted,
            };
          }),
        );
      }
    });
  };

  const onTransactionSubmit = (description: string, amount: number): void => {
    sendAPIRequest(`semesters/${semesterId}/transactions`, "POST", {
      description,
      amount,
    }).then(({ status }) => {
      if (status === 201) {
        sendAPIRequest<Transaction[]>(
          `semesters/${semesterId}/transactions`,
        ).then(({ data }) => {
          if (data) {
            setTransactions(data);
          }
        });
      }
    });

    setShowTransactionModal(false);
  };

  const onMembershipSubmit = (
    userId: string,
    paid: boolean,
    discounted: boolean,
  ): void => {
    sendAPIRequest("memberships", "POST", {
      semesterId,
      userId,
      paid,
      discounted,
    }).then(({ status }) => {
      if (status === 201) {
        setShowMembershipModal(false);
      }
    });
  };

  const onUserSubmit = (
    user: Partial<User>,
    paid: boolean,
    discounted: boolean,
  ): Promise<boolean> => {
    // Create user first
    return sendAPIRequest("users", "POST", {
      id: Number(user.id),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      faculty: user.faculty,
      questId: user.questId,
    }).then(({ status }) => {
      if (status !== 201) {
        return false;
      }

      sendAPIRequest("memberships", "POST", {
        semesterId,
        userId: Number(user.id),
        paid,
        discounted,
      }).then(({ status }) => {
        if (status === 201) setShowMembershipModal(false);
      });

      return true;
    });
  };

  const handleDelete = (id: number): void => {
    sendAPIRequest(`semesters/${semesterId}/transactions/${id}`, "DELETE").then(
      ({ status }) => {
        if (status === 204) {
          sendAPIRequest<Transaction[]>(
            `semesters/${semesterId}/transactions`,
          ).then(({ data }) => {
            if (data) {
              setTransactions(data);
            }
          });
        }
      },
    );
  };

  return (
    <div>
      <div className="Semester__highlights">
        <div className="card Semester__highlight-item">
          <div className="card-body">
            <h2 className="card-title">
              {Number(semester?.startingBudget).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </h2>
            <h6 className="card-subtitle mb-2 text-muted">Starting Budget</h6>
          </div>
        </div>

        <div className="card Semester__highlight-item">
          <div className="card-body">
            <h2 className="card-title">
              {Number(semester?.currentBudget).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </h2>
            <h6 className="card-subtitle mb-2 text-muted">Current Budget</h6>
          </div>
        </div>

        <div className="card Semester__highlight-item">
          <div className="card-body">
            <h2 className="card-title">
              {Number(semester?.membershipFee).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </h2>
            <h6 className="card-subtitle mb-2 text-muted">Membership Fee</h6>
          </div>
        </div>

        <div className="card Semester__highlight-item">
          <div className="card-body">
            <h2 className="card-title">
              {Number(semester?.membershipDiscountFee).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </h2>
            <h6 className="card-subtitle mb-2 text-muted">
              Membership Fee (Discounted)
            </h6>
          </div>
        </div>

        <div className="card Semester__highlight-item">
          <div className="card-body">
            <h2 className="card-title">
              {Number(semester?.rebuyFee).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </h2>
            <h6 className="card-subtitle mb-2 text-muted">Rebuy Fee</h6>
          </div>
        </div>
      </div>

      <div className="Memberships__header">
        <h3>Memberships ({memberships.length})</h3>
        <div className="Memberships__header__search">
          <input
            type="text"
            placeholder="Search..."
            className="form-control search"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          ></input>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowMembershipModal(true)}
          >
            New member
          </button>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Student ID</th>

            <th>First Name</th>

            <th>Last Name</th>

            <th>Paid</th>

            <th>Discounted</th>

            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredMemberships.map((m) => (
            <tr key={m.id}>
              <td>{m.userId}</td>

              <td>{m.firstName}</td>

              <td>{m.lastName}</td>

              <td>{m.paid ? "Yes" : "No"}</td>

              <td>{m.discounted ? "Yes" : "No"}</td>

              <td>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => updateMembership(m.id, !m.paid, m.discounted)}
                >
                  Set {m.paid ? "Unpaid" : "Paid"}
                </button>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => updateMembership(m.id, m.paid, !m.discounted)}
                >
                  {m.discounted ? "Remove Discount" : "Discount"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="Transactions__header">
        <h3>Transactions</h3>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowTransactionModal(true)}
        >
          New transaction
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>

            <th>Description</th>

            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>

              <td>{t.description}</td>

              <td>
                {t.amount >= 0
                  ? `$${Number(t.amount).toFixed(2)}`
                  : `-$${Number(t.amount * -1).toFixed(2)}`}
              </td>

              <td style={{ textAlign: "right" }}>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleDelete(t.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <NewTransactionModal
        show={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        onSubmit={onTransactionSubmit}
      />

      <NewMembershipModal
        show={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
        onMemberSubmit={onMembershipSubmit}
        onUserSubmit={onUserSubmit}
      />
    </div>
  );
}

export default SemesterInfo;
