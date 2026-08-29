import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Building2,
  Star,
  Users,
  LogOut,
  Plus,
  Search,
  LockKeyhole,
  ArrowUpDown,
  Store,
} from "lucide-react";
import "./styles.css";
import "./owner.css";
import "./reference.css";
import "./charts.css";
import "./enhancements.css";
const API = "http://localhost:4000/api";
async function request(path, method = "GET", body, token) {
  const r = await fetch(API + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.message || "Request failed");
  return data;
}
const fullName = "Avery Elizabeth Montgomery";
const fields = { name: fullName, email: "", address: "", password: "" };
const today = new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date());
function storedAvatar(id) { return localStorage.getItem(`ss_avatar_${id}`); }
function Avatar({ user, className = "avatar" }) { const image = storedAvatar(user.id); return <div className={className}>{image ? <img src={image} alt="" /> : user.name[0]}</div>; }
function Highlight({ value, query }) { const text = String(value ?? ""); if (!query.trim()) return text; const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig")); return parts.map((part, i) => part.toLowerCase() === query.toLowerCase() ? <mark key={i}>{part}</mark> : part); }
function Auth({ onAuth }) {
  const [login, setLogin] = useState(true),
    [form, setForm] = useState({
      email: "admin@storescore.demo",
      password: "Demo@123",
      ...fields,
    }),
    [error, setError] = useState(""), [resetBusy, setResetBusy] = useState(false),
    [busy, setBusy] = useState(false);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const d = await request(
        `/auth/${login ? "login" : "register"}`,
        "POST",
        form,
      );
      onAuth(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function forgotPassword() { setResetBusy(true); setError(""); try { await request("/auth/forgot", "POST", { email: form.email }); setError("Password reset to Demo@123. Use that reset password to sign in."); } catch (e) { setError(e.message); } finally { setResetBusy(false); } }
  return (
    <main className="auth">
      <section className="brand-panel">
        <div className="brand">
          <Store /> StoreScore
        </div>
        <h1>Make every store experience count.</h1>
        <p>
          A focused ratings platform for customers, owners, and administrators.
        </p>
        <div className="mini-card">
          <Star fill="currentColor" /> <b>Transparent ratings</b>
          <span>One place to discover, rate, and grow.</span>
        </div>
      </section>
      <section className="auth-card">
        <time className="site-date">{today}</time>
        <div className="eyebrow">WELCOME TO STORESCORE</div>
        <h2>{login ? "Sign in to your account" : "Create your account"}</h2>
        <p className="muted">
          {login
            ? "Use a demo account or your own credentials."
            : "Join as a customer and start rating stores."}
        </p>
        <form onSubmit={submit}>
          {!login && (
            <>
              <Input
                label="Full name"
                name="name"
                value={form.name}
                onChange={change}
              />
              <Input
                label="Address"
                name="address"
                value={form.address}
                onChange={change}
              />
            </>
          )}
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={change}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={change}
          />
          {login && <button type="button" className="forgot" onClick={forgotPassword} disabled={resetBusy}>Forgot password?</button>}
          {error && <div className="error">{error}</div>}
          <button className="primary" disabled={busy}>
            {busy ? "Please wait…" : login ? "Sign in" : "Create account"}
          </button>
        </form>
        <button
          className="link"
          onClick={() => {
            setLogin(!login);
            setError("");
          }}
        >
          {login
            ? "New here? Create a customer account"
            : "Already have an account? Sign in"}
        </button>
        <p className="demo">
          Demo password: <code>Demo@123</code>
        </p>
      </section>
    </main>
  );
}
function Input({ label, ...props }) {
  const isEmail = props.type === "email";
  const emailRules = isEmail
    ? {
        pattern:
          "^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$",
        maxLength: 254,
        title: "Use a real address such as name@example.com.",
        onInvalid: (e) =>
          e.currentTarget.setCustomValidity(
            "Email is invalid. Use a real address such as name@example.com.",
          ),
        onInput: (e) => e.currentTarget.setCustomValidity(""),
      }
    : {};
  return (
    <label>
      {label}
      <input required {...emailRules} {...props} />
    </label>
  );
}
function App() {
  const [session, setSession] = useState(() =>
    JSON.parse(localStorage.getItem("ss_session") || "null"),
  );
    const logout = () => {
    localStorage.removeItem("ss_session");
    setSession(null);
  };
  if (!session)
    return (
      <Auth
        onAuth={(d) => {
          localStorage.setItem("ss_session", JSON.stringify(d));
          setSession(d);
        }}
      />
    );
  return <Shell session={session} logout={logout} />;
}
function Shell({ session, logout }) {
  const [tab, setTab] = useState("dashboard");
  const [notice, setNotice] = useState("");
  const [ownerUnread, setOwnerUnread] = useState(false);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(""), 4200); return () => clearTimeout(timer); }, [notice]);
  const isAdmin = session.user.role === "ADMIN",
    isOwner = session.user.role === "OWNER";
  const roleLabel = isAdmin
    ? "System administrator"
    : isOwner
      ? "Store owner"
      : "Normal user";
  return (
    <div className="app">
      <aside>
        <div className="brand">
          <Star fill="currentColor" /> Store Rating Platform
        </div>
        <div className="role-chip">{roleLabel}</div>
        <nav>
          {isAdmin && (
            <Nav
              icon={<Building2 />}
              active={tab === "dashboard"}
              onClick={() => setTab("dashboard")}
            >
              Dashboard
            </Nav>
          )}
          {isOwner && (
            <Nav
              icon={<Building2 />}
              active={tab === "dashboard"}
              onClick={() => setTab("dashboard")}
            >
              Dashboard
            </Nav>
          )}
          {isAdmin && (
            <Nav
              icon={<Store />}
              active={tab === "stores"}
              onClick={() => setTab("stores")}
            >
              Stores
            </Nav>
          )}
          {isAdmin && (
            <Nav
              icon={<Users />}
              active={tab === "users"}
              onClick={() => setTab("users")}
            >
              Users
            </Nav>
          )}
          {isOwner && (
            <Nav
              icon={<Users />}
              active={tab === "stores"}
              onClick={() => setTab("stores")}
            >
              Users ratings
            </Nav>
          )}
          {!isAdmin && !isOwner && (
            <Nav
              icon={<Store />}
              active={tab === "stores"}
              onClick={() => setTab("stores")}
            >
              Stores
            </Nav>
          )}
          <Nav
            icon={<LockKeyhole />}
            active={tab === "password"}
            onClick={() => setTab("password")}
          >
            Profile & password
          </Nav>
          {isAdmin && <Nav icon={<Users />} active={tab === "past-users"} onClick={() => setTab("past-users")}>Past users</Nav>}
        </nav>
        <div className="profile">
          <Avatar user={session.user} />
          <div>
            <b>{session.user.name}</b>
            <small>{roleLabel}</small>
          </div>
        </div>
        <button className="logout" onClick={logout}>
          <LogOut /> Logout
        </button>
        {!isAdmin && !isOwner && <button className="delete-account" onClick={async () => { if (!window.confirm("Delete your account and remove your ratings?")) return; try { await request("/auth/account", "DELETE", null, session.token); logout(); } catch (e) { setNotice(e.message); } }}>Delete account</button>}
      </aside>
      <main className="content">
        <div className="topbar">
          <span className="crumb">Home / {tab}</span>
          <div>
            <span className={`notification ${ownerUnread ? "has-notification" : ""}`} title={ownerUnread ? "New store rating" : "No new notifications"}>●</span>
            <b>{session.user.name}</b>
            <small>{roleLabel}</small>
            <time>{today}</time>
          </div>
        </div>
        {notice && <div className="toast">{notice}</div>}
        {isAdmin && tab === "dashboard" && (
          <AdminDashboard token={session.token} />
        )}{" "}
        {isOwner && tab === "dashboard" && (
          <StoresPage
            token={session.token}
            role={session.user.role}
            notify={setNotice}
            setOwnerUnread={setOwnerUnread}
            dashboard
          />
        )}{" "}
        {isAdmin && tab === "users" && (
          <UsersPage token={session.token} notify={setNotice} />
        )}{" "}
        {isAdmin && tab === "past-users" && <PastUsersPage token={session.token} />}{" "}
        {tab === "stores" && (
          <StoresPage
            token={session.token}
            role={session.user.role}
            notify={setNotice}
            setOwnerUnread={setOwnerUnread}
          />
        )}{" "}
        {tab === "password" && (
          <ProfilePage session={session} token={session.token} notify={setNotice} />
        )}
      </main>
    </div>
  );
}
function Nav({ icon, active, onClick, children }) {
  return (
    <button onClick={onClick} className={active ? "active" : ""}>
      {icon}
      {children}
    </button>
  );
}
function AdminDashboard({ token }) {
  const [stats, setStats] = useState({
    users: 0,
    stores: 0,
    ratings: 0,
    average_rating: "—",
    growth: {},
    roles: [],
    ratingDistribution: [],
  });
  useEffect(() => {
    request("/admin/stats", "GET", null, token)
      .then(setStats)
      .catch(() => {});
  }, []);
  return (
    <>
      <Header
        eyebrow="ADMIN DASHBOARD"
        title="Admin Dashboard"
        text="Platform activity at a glance."
      />
      <div className="stats">
        <Stat
          icon={<Users />}
          value={stats.users}
          label="Total users"
          growth={stats.growth?.users}
        />
        <Stat
          icon={<Building2 />}
          value={stats.stores}
          label="Total stores"
          growth={stats.growth?.stores}
        />
        <Stat
          icon={<Star />}
          value={stats.ratings}
          label="Total ratings"
          growth={stats.growth?.ratings}
        />
        <Stat
          icon={<Star />}
          value={stats.average_rating || "—"}
          label="Average rating"
          growth={null}
        />
      </div>
      <div className="chart-grid">
        <RatingChart rows={stats.ratingDistribution} />
        <RoleChart rows={stats.roles} total={stats.users} />
        <div className="quick-actions">
          <h3>Quick actions</h3>
          <button
            onClick={() =>
              document.querySelector("nav button:nth-child(2)")?.click()
            }
          >
            <Store /> Manage stores
          </button>
          <button
            onClick={() =>
              document.querySelector("nav button:nth-child(3)")?.click()
            }
          >
            <Users /> Manage users
          </button>
          <button>
            <Star /> Review ratings
          </button>
        </div>
      </div>
    </>
  );
}
function Stat({ icon, value, label, growth }) {
  const positive = growth === null || growth >= 0;
  return (
    <div className="stat">
      <span>{icon}</span>
      <b>{value}</b>
      <p>{label}</p>
      {growth !== null && (
        <small className={positive ? "up" : "down"}>
          {positive ? "↑" : "↓"} {Math.abs(growth || 0)}% from last month
        </small>
      )}
    </div>
  );
}
function RatingChart({ rows }) {
  const [active, setActive] = useState(null);
  const values = [1, 2, 3, 4, 5].map((r) => ({
    rating: r,
    count: Number(rows.find((x) => Number(x.rating) === r)?.count || 0),
  }));
  const max = Math.max(1, ...values.map((x) => x.count));
  return (
    <section className="chart-card">
      <h3>Store rating overview</h3>
      <div className="bar-chart">
        {values.map((x) => (
          <div
            key={x.rating}
            className={`bar-wrap ${active && active !== x.rating ? "muted" : ""}`}
            onMouseEnter={() => setActive(x.rating)}
            onMouseLeave={() => setActive(null)}
          >
            <span className="bar-value">{x.count}</span>
            <div
              className="bar"
              style={{ height: `${Math.max(8, (x.count / max) * 100)}%` }}
              title={`${x.rating} star: ${x.count} ratings`}
            />
            <small>
              {x.rating} star{x.rating > 1 ? "s" : ""}
            </small>
          </div>
        ))}
      </div>
      <p className="chart-hint">Hover a bar to focus it.</p>
    </section>
  );
}
function RoleChart({ rows, total }) {
  const [active, setActive] = useState(null);
  const roles = [
    ["USER", "Users", "#2563eb"],
    ["OWNER", "Store owners", "#20b566"],
    ["ADMIN", "Admins", "#7c3aed"],
  ].map(([key, label, color]) => ({
    key,
    label,
    color,
    count: Number(rows.find((x) => x.role === key)?.count || 0),
  }));
  let offset = 0;
  const radius = 40,
    circ = 2 * Math.PI * radius;
  return (
    <section className="chart-card">
      <h3>User role distribution</h3>
      <div className="donut-layout">
        <svg className="donut" viewBox="0 0 110 110">
          {roles.map((role) => {
            const portion = total ? role.count / total : 0;
            const dash = portion * circ;
            const current = offset;
            offset += dash;
            return (
              <circle
                key={role.key}
                className={active && active !== role.key ? "muted" : ""}
                cx="55"
                cy="55"
                r={radius}
                fill="none"
                stroke={role.color}
                strokeWidth="18"
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-current}
                transform="rotate(-90 55 55)"
                onMouseEnter={() => setActive(role.key)}
                onMouseLeave={() => setActive(null)}
              >
                <title>{`${role.label}: ${role.count} (${total ? Math.round(portion * 100) : 0}%)`}</title>
              </circle>
            );
          })}
          <text x="55" y="51" textAnchor="middle" className="donut-total">
            {total}
          </text>
          <text x="55" y="65" textAnchor="middle" className="donut-sub">
            users
          </text>
        </svg>
        <div className="legend">
          {roles.map((role) => {
            const pct = total ? Math.round((role.count / total) * 100) : 0;
            return (
              <button
                key={role.key}
                className={active && active !== role.key ? "muted" : ""}
                onMouseEnter={() => setActive(role.key)}
                onMouseLeave={() => setActive(null)}
              >
                <i style={{ background: role.color }} />
                {role.label} ({pct}%)
              </button>
            );
          })}
        </div>
      </div>
      <p className="chart-hint">Hover a segment to focus it.</p>
    </section>
  );
}
function Header({ eyebrow, title, text, action }) {
  return (
    <header className="page-head">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {action}
    </header>
  );
}
function SortHead({ label, col, sort, setSort }) {
  return (
    <th
      onClick={() =>
        setSort({
          by: col,
          dir: sort.by === col && sort.dir === "asc" ? "desc" : "asc",
        })
      }
    >
      {label}
      <ArrowUpDown size={13} />
    </th>
  );
}
function UsersPage({ token, notify }) {
  const [users, setUsers] = useState([]),
    [search, setSearch] = useState(""),
    [role, setRole] = useState(""),
    [sort, setSort] = useState({ by: "name", dir: "asc" }),
    [show, setShow] = useState(false),
    [error, setError] = useState("");
  const load = async () => {
    try {
      const data = await request(
        `/admin/users?search=${encodeURIComponent(search)}&role=${encodeURIComponent(role)}&sort=${sort.by}&dir=${sort.dir}`,
        "GET",
        null,
        token,
      );
      setUsers(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      setUsers([]);
      setError(`Could not load users: ${e.message}`);
    }
  };
  useEffect(() => {
    load();
  }, [search, role, sort]);
  return (
    <>
      <Header
        eyebrow="USER DIRECTORY"
        title="Manage users"
        text="Search, filter, and inspect everyone on the platform."
        action={<button className="primary compact" onClick={() => setShow(true)}><Plus /> Add user</button>}
      />
            {error && <div className="error">{error}</div>}
            <div className="toolbar">
              <div className="search">
                <Search />
                <input
                  placeholder="Search name, email, address…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="">All roles</option>
                <option value="USER">Normal user</option>
                <option value="ADMIN">Administrator</option>
                <option value="OWNER">Store owner</option>
              </select>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <SortHead label="Name" col="name" sort={sort} setSort={setSort} />
                    <SortHead
                      label="Email"
                      col="email"
                      sort={sort}
                      setSort={setSort}
                    />
                    <SortHead
                      label="Address"
                      col="address"
                      sort={sort}
                      setSort={setSort}
                    />
                    <SortHead label="Role" col="role" sort={sort} setSort={setSort} />
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <span className="person-cell"><Avatar user={u} /><b><Highlight value={u.name} query={search} /></b></span></td>
                      <td><Highlight value={u.email} query={search} /></td>
                      <td><Highlight value={u.address} query={search} /></td>
                      <td>
                        <span className="badge">{u.role}</span>
                      </td>
                    </tr>
                  ))}
                  {!users.length && (
                    <tr>
                      <td colSpan="4" className="empty">
                        No users match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
      {show && (
        <UserModal
          token={token}
          close={() => setShow(false)}
          done={() => {
            setShow(false);
            load();
            notify("User created successfully.");
          }}
        />
      )}
    </>
  );
}
function UserModal({ token, close, done }) {
  const [form, setForm] = useState({ ...fields, role: "USER" }),
    [error, setError] = useState("");
  return (
    <Modal title="Add a platform user" close={close}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await request("/admin/users", "POST", form, token);
            done();
          } catch (e) {
            setError(e.message);
          }
        }}
      >
        <Input
          label="Full name"
          name="name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, [e.target.name]: e.target.value })
          }
        />
        <Input
          label="Email"
          name="email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, [e.target.name]: e.target.value })
          }
        />
        <Input
          label="Address"
          name="address"
          value={form.address}
          onChange={(e) =>
            setForm({ ...form, [e.target.name]: e.target.value })
          }
        />
        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, [e.target.name]: e.target.value })
          }
        />
        <label>
          Role
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="USER">Normal user</option>
            <option value="ADMIN">Administrator</option>
            <option value="OWNER">Store owner</option>
          </select>
        </label>
        {error && <div className="error">{error}</div>}
        <button className="primary">Create user</button>
      </form>
    </Modal>
  );
}
function PastUsersPage({ token }) {
  const [users, setUsers] = useState([]);
  useEffect(() => { request("/admin/past-users", "GET", null, token).then(setUsers).catch(() => setUsers([])); }, [token]);
  return <><Header eyebrow="ARCHIVE" title="Past users" text="Accounts deleted by normal users are retained here for administrators." /><div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Deleted</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><span className="person-cell"><Avatar user={user} /><b>{user.name}</b></span></td><td>{user.email}</td><td>{user.role}</td><td>{new Date(user.deleted_at).toLocaleDateString()}</td></tr>)}{!users.length && <tr><td colSpan="4" className="empty">No past users.</td></tr>}</tbody></table></div></>;
}
function StoresPage({ token, role, notify, setOwnerUnread, dashboard = false }) {
  const [stores, setStores] = useState([]),
    [search, setSearch] = useState(""),
    [sort, setSort] = useState({ by: "name", dir: "asc" }),
    [show, setShow] = useState(false),
    [owner, setOwner] = useState(null),
    [error, setError] = useState("");
        const admin = role === "ADMIN";
  const load = async () => {
    try {
      const data = await request(
        `/stores?search=${encodeURIComponent(search)}&sort=${sort.by}&dir=${sort.dir}`,
        "GET",
        null,
        token,
      );
      setStores(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      setStores([]);
      setError(`Could not load stores: ${e.message}`);
    }
  };
  async function deleteStore(id) { if (!window.confirm("Delete this store and its ratings?")) return; try { await request(`/admin/stores/${id}`, "DELETE", null, token); await load(); notify("Store deleted successfully."); } catch (e) { notify(e.message); } }
  useEffect(() => {
    if (role === "OWNER") {
      const loadOwner = () => request("/owner/dashboard", "GET", null, token).then(setOwner).catch((e) => setOwner({ summary: null, raters: [], error: e.message }));
      loadOwner();
      const timer = setInterval(loadOwner, 30000);
      return () => clearInterval(timer);
    }
    load();
  }, [search, sort, role]);
  if (role === "OWNER") return <OwnerPage owner={owner} setOwnerUnread={setOwnerUnread} dashboard={dashboard} />;
  return (
    <>
      <Header
        eyebrow={admin ? "STORE DIRECTORY" : "DISCOVER STORES"}
        title={admin ? "Manage stores" : "Rate stores you have visited"}
        text={
          admin
            ? "Create and search the stores in your marketplace."
            : "Your rating is private to you and can be changed anytime."
        }
        action={
          admin && (
            <button className="primary compact" onClick={() => setShow(true)}>
              <Plus /> Add store
            </button>
          )
        }
      />
            {error && <div className="error">{error}</div>}
            <div className="toolbar">
              <div className="search">
                <Search />
                <input
                  placeholder="Search store name or address…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <SortHead
                      label="Store"
                      col="name"
                      sort={sort}
                      setSort={setSort}
                    />
                    {admin && (
                      <SortHead
                        label="Email"
                        col="email"
                        sort={sort}
                        setSort={setSort}
                      />
                    )}
                    <SortHead
                      label="Address"
                      col="address"
                      sort={sort}
                      setSort={setSort}
                    />
                    <SortHead
                      label="Overall rating"
                      col="average_rating"
                      sort={sort}
                      setSort={setSort}
                    />
                    {role === "USER" && <th>Your rating</th>}
                    {admin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {stores.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <span className="person-cell"><div className="avatar store-avatar">{s.name[0]}</div><b><Highlight value={s.name} query={search} /></b></span></td>
                      {admin && <td><Highlight value={s.email} query={search} /></td>}
                      <td><Highlight value={s.address} query={search} /></td>
                      <td>
                        <Rating value={s.average_rating} />
                        <small> {s.rating_count} ratings</small>
                      </td>
                      {role === "USER" && (
                        <td>
                          <RatingEditor
                            store={s}
                            token={token}
                            done={() => {
                              load();
                              notify("Your rating has been saved.");
                            }}
                          />
                        </td>
                      )}
                      {admin && <td><button className="danger-action" onClick={() => deleteStore(s.id)}>Delete</button></td>}
                    </tr>
                  ))}
                  {!stores.length && (
                    <tr>
                      <td colSpan="5" className="empty">
                        No stores match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {show && (
              <StoreModal
                token={token}
                close={() => setShow(false)}
                done={() => {
                  setShow(false);
                  load();
                  notify("Store created successfully.");
                }}
              />
            )}
          </>
  );
}
function Rating({ value }) {
  return (
    <span className="rating">
      <Star size={15} fill="currentColor" />
      {value || "—"}
    </span>
  );
}
function RatingEditor({ store, token, done }) {
  const [value, setValue] = useState(store.user_rating || 0),
    [busy, setBusy] = useState(false);
  async function save(v) {
    setValue(v);
    setBusy(true);
    try {
      await request(`/stores/${store.id}/rating`, "POST", { rating: v }, token);
      done();
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((x) => (
        <button
          disabled={busy}
          key={x}
          onClick={() => save(x)}
          aria-label={`${x} stars`}
          className={x <= value ? "on" : ""}
        >
          <Star size={18} fill="currentColor" />
        </button>
      ))}
    </div>
  );
}
function StoreModal({ token, close, done }) {
  const [form, setForm] = useState({
      name: "",
      email: "",
      address: "",
      ownerId: "",
    }),
    [owners, setOwners] = useState([]),
    [error, setError] = useState("");
  useEffect(() => {
    request("/admin/users?role=OWNER", "GET", null, token).then(setOwners);
  }, []);
  return (
    <Modal title="Add a registered store" close={close}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await request("/admin/stores", "POST", form, token);
            done();
          } catch (e) {
            setError(e.message);
          }
        }}
      >
        <Input
          label="Store name"
          name="name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, [e.target.name]: e.target.value })
          }
        />
        <Input
          label="Store email"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, [e.target.name]: e.target.value })
          }
        />
        <Input
          label="Address"
          name="address"
          value={form.address}
          onChange={(e) =>
            setForm({ ...form, [e.target.name]: e.target.value })
          }
        />
        <label>
          Store owner (optional)
          <select
            value={form.ownerId}
            onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
          >
            <option value="">Assign later</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
        {error && <div className="error">{error}</div>}
        <button className="primary">Create store</button>
      </form>
    </Modal>
  );
}
function OwnerPage({ owner, setOwnerUnread, dashboard }) {
  if (!owner) return <div className="loading">Loading dashboard…</div>;
  if (!owner.summary)
    return (
      <>
        <Header
          eyebrow="STORE OWNER"
          title="No store assigned"
          text="Ask an administrator to link your account to a registered store."
        />
      </>
    );
    const { summary, raters } = owner;
    useEffect(() => { const key = `ss_owner_ratings_${summary.id}`; const seen = Number(localStorage.getItem(key) || 0); setOwnerUnread?.(Number(summary.rating_count) > seen); }, [summary.id, summary.rating_count, setOwnerUnread]);
  return (
    <>
      <Header
        eyebrow="STORE OWNER DASHBOARD"
        title="Your store at a glance"
        text="Monitor customer feedback and rating performance."
      />
      <section className="owner-hero">
        <div className="store-icon">
          <Store />
        </div>
        <div>
          <h2>{summary.name}</h2>
          <p>{summary.address}</p>
        </div>
        <div className="average-box">
          <small>Average rating</small>
          <b>
            <Star fill="currentColor" /> {summary.average_rating || "—"}
          </b>
        </div>
      </section>
      {!dashboard && <section className="owner-notice"><b>{Number(summary.rating_count) > Number(localStorage.getItem(`ss_owner_ratings_${summary.id}`) || 0) ? "New store rating received" : "Notifications up to date"}</b><span>{Number(summary.rating_count) > Number(localStorage.getItem(`ss_owner_ratings_${summary.id}`) || 0) ? "A customer recently rated your store." : "You are all caught up."}</span></section>}
      {!dashboard && <section className="owner-grid">
        <div className="owner-raters">
          <div className="section-line">
            <h3>Users who rated your store</h3>
            <span>{summary.rating_count} total</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Rating</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {raters.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <b>{r.name}</b>
                    </td>
                    <td>
                      <Rating value={r.rating} />
                    </td>
                    <td>{new Date(r.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!raters.length && (
                  <tr>
                    <td colSpan="3" className="empty">
                      No customer ratings yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <aside className="rating-details">
          <div className="detail-icon">
            <Building2 />
          </div>
          <h3>Store details</h3>
          <Metric label="Total ratings" value={summary.rating_count} />
          <Metric label="Average rating" value={summary.average_rating || "—"} />
          <Metric label="Highest rating" value={summary.highest_rating || "—"} />
          <Metric label="Lowest rating" value={summary.lowest_rating || "—"} />
          <button className="primary compact" onClick={() => { localStorage.setItem(`ss_owner_ratings_${summary.id}`, summary.rating_count); setOwnerUnread?.(false); }}>Mark notifications read</button>
        </aside>
      </section>}
      {dashboard && <OwnerCharts raters={raters} />}
    </>
  );
}
function OwnerCharts({ raters }) {
  const distribution = [1, 2, 3, 4, 5].map((rating) => ({ rating, count: raters.filter((r) => Number(r.rating) === rating).length }));
  const max = Math.max(1, ...distribution.map((x) => x.count));
  return <section className="owner-charts"><ChartPanel title="Rating trend"><div className="line-chart">{raters.slice(0, 8).reverse().map((r, i) => <span key={i} style={{ height: `${Math.max(12, Number(r.rating) / 5 * 100)}%` }} title={`${r.rating} stars`} />)}</div></ChartPanel><ChartPanel title="Ratings by score"><div className="owner-bars">{distribution.map((x) => <div key={x.rating}><span style={{ height: `${Math.max(8, x.count / max * 100)}%` }} /><small>{x.rating}</small></div>)}</div></ChartPanel><ChartPanel title="Rating mix"><div className="pie-chart" style={{ background: `conic-gradient(#dc8d32 0 35%, #2573b8 35% 65%, #20a565 65% 85%, #d95f59 85%)` }}><b>{raters.length}</b><small>ratings</small></div></ChartPanel></section>;
}
function ChartPanel({ title, children }) { return <section className="chart-card owner-chart"><h3>{title}</h3>{children}</section>; }
function Metric({ label, value }) {
  return (
    <div className="metric-row">
      <span>
        <Star size={16} />
        {label}
      </span>
      <b>{value}</b>
    </div>
  );
}
function ProfilePage({ session, token, notify }) {
  const [name, setName] = useState(session.user.name), [image, setImage] = useState(storedAvatar(session.user.id));
  function upload(e) { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { localStorage.setItem(`ss_avatar_${session.user.id}`, reader.result); setImage(reader.result); notify("Profile picture updated."); }; reader.readAsDataURL(file); }
  return <><Header eyebrow="PROFILE" title="Your profile" text="Manage your identity across the platform." /><section className="profile-editor"><Avatar user={{...session.user, name}} className="profile-avatar" /><div><h2>{name}</h2><p>{session.user.email}</p><label className="upload-label">Add profile picture<input type="file" accept="image/*" onChange={upload} /></label>{image && <button className="link" onClick={() => { localStorage.removeItem(`ss_avatar_${session.user.id}`); setImage(null); notify("Profile picture removed."); }}>Remove picture</button>}</div></section><PasswordPage token={token} notify={notify} /></>;
}
function PasswordPage({ token, notify }) {
  const [password, setPassword] = useState(""),
    [error, setError] = useState("");
  return (
    <>
      <Header
        eyebrow="SECURITY"
        title="Update your password"
        text="Use 8–16 characters with an uppercase letter and special character."
      />
      <div className="password-card">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await request("/auth/password", "PATCH", { password }, token);
              setPassword("");
              setError("");
              notify("Password updated successfully.");
            } catch (e) {
              setError(e.message);
            }
          }}
        >
          <Input
            label="New password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <div className="error">{error}</div>}
          <button className="primary">Update password</button>
        </form>
      </div>
    </>
  );
}
function Modal({ title, close, children }) {
  return (
    <div className="modal-bg">
      <div className="modal">
        <button className="close" onClick={close}>
          ×
        </button>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
