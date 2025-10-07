"use client";
import React, { useState } from "react";
import { Input, Button, Select } from "@mantine/core";
import axios from "axios";

function page() {
  const [schoolName, setSchoolName] = useState("");
  const [schoolLocation, setSchoolLocation] = useState("");
  const [schoolTier, setSchoolTier] = useState("");
  const [schoolCategory, setSchoolCategory] = useState("");

  const handleAddSchool = async () => {
    await axios.post("/api/add-school", {
      name: schoolName,
      location: schoolLocation,
      tiers: schoolTier,
      category: schoolCategory,
    });
  };
  return (
    <div className="m-10 flex flex-col gap-3">
      <Input
        className="w-50"
        placeholder="School Name"
        value={schoolName}
        onChange={(e) => setSchoolName(e.target.value)}
      />
      <Input
        className="w-50"
        placeholder="School Location"
        value={schoolLocation}
        onChange={(e) => setSchoolLocation(e.target.value)}
      />
      <Select
        className="w-50"
        placeholder="School Tier"
        data={["SAFETY", "TARGET", "REACH"]}
        value={schoolTier}
        onChange={(value) => setSchoolTier(value ?? "SAFETY")}
      />
      <Select
        className="w-50"
        placeholder="School Category"
        data={[
          "AROUND_ILLINOIS",
          "IN_CHICAGO",
          "IN_ILLINOIS",
          "IN_CALIFORNIA",
          "FAR",
        ]}
        value={schoolCategory}
        onChange={(value) => setSchoolCategory(value ?? "IN_CHICAGO")}
      />
      <div className="w-100">
        <Button onClick={handleAddSchool}>Add School</Button>
      </div>
    </div>
  );
}

export default page;
