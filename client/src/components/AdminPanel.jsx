import React from "react";

export default function AdminPanel() {
  const [message, setMessage] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [users, setUsers] = useState([]);
  return (
    <div>
      <h3>Admin - Send Notification</h3>
      <form className="mb-2 p-2 border">
        <h4>Send</h4>
        <div>
          <label>Message</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <div>
          <label>
            Target Users (If you leave it blank or select 'Everyone' it will go
            to everyone)
          </label>
          <select
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
          >
            <option value="all">Herkese</option>
            {/* {} */}
          </select>
        </div>
        <button type="submit">Send</button>
      </form>

      <hr />

      {/* <form
        onSubmit={handleSubmitHttp}
        style={{
          marginTop: "20px",
          padding: "10px",
          border: "1px dashed green",
        }}
      >
        <h4>HTTP API ile Gönder (Backend route'u tetikler)</h4>
        <div>
          <label>Mesaj:</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <div>
          <label>
            Hedef Kullanıcı (Boş bırakırsanız veya 'Herkese' seçerseniz herkese
            gider):
          </label>
          <select
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
          >
            <option value="all">Herkese</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.username} (ID: {user._id})
              </option>
            ))}
          </select>
        </div>
        <button type="submit">HTTP ile Gönder</button>
      </form> */}
    </div>
  );
}
