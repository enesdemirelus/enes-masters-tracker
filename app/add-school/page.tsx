"use client";

import { useState } from "react";
import axios from "axios";

export default function Page() {
  const [success, setSuccess] = useState(false);

  const handleAddSchool = async () => {
    await axios.post("/api/add-school", {
      name: "MIT",
      location: "Cambridge, MA",
      tiers: "TARGET",
    });
    setSuccess(true);
  };

  return (
    <div>
      <button onClick={handleAddSchool}>Add School</button>
      {success && <p>Success!</p>}
    </div>
  );
}
