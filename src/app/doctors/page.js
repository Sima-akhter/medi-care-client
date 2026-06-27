"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/Card";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import Skeleton, { SkeletonCards } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import { apiRequest } from "@/lib/api-client";
import { Stethoscope, Star, Award, DollarSign, Search, CalendarDays } from "lucide-react";
import Footer from "@/components/Footer"; // We will create/update the Footer component later

export default function FindDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      // Fetch approved doctors
      const res = await apiRequest("/doctors?status=approved&limit=100");
      if (res.success) {
        setDoctors(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const specialties = [
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Dermatology",
    "Pediatrics",
    "General Medicine",
    "Gynecology",
    "Dentistry"
  ];

  // Filtering on client side for immediate interaction
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || 
                          doc.specialization.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = specialtyFilter === "" || doc.specialization.toLowerCase() === specialtyFilter.toLowerCase();
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-150">
      <PublicNavbar />

      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full space-y-10">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Directory</span>
          <h1 className="text-2xl font-black text-foreground mt-1">Find Doctors & Specialists</h1>
          <p className="text-xs text-muted-foreground">Browse through certified and approved medical practitioners</p>
        </div>

        {/* SEARCH & FILTERS PANEL */}
        <div className="flex flex-col sm:flex-row gap-4 items-center bg-card border border-border p-4 rounded-xs">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search doctors by name or specialization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-xs pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="w-full sm:w-60 bg-background border border-border rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
          >
            <option value="">All Specializations</option>
            {specialties.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        {/* DOCTORS GRID */}
        {loading ? (
          <SkeletonCards />
        ) : filteredDoctors.length === 0 ? (
          <EmptyState 
            title="No Doctors Found" 
            description="We couldn't find any approved specialists matching your search queries." 
            icon={Stethoscope}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <Card key={doc._id} className="flex flex-col justify-between hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3 flex flex-row items-center gap-4">
                  <div className="shrink-0">
                    {doc.image ? (
                      <img
                        src={doc.image}
                        alt={doc.name}
                        className="w-16 h-16 object-cover border border-border rounded-xs"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black text-lg rounded-xs">
                        {doc.name ? doc.name[0].toUpperCase() : "D"}
                      </div>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">{doc.name}</CardTitle>
                    <Badge variant="success" className="mt-1">
                      {doc.specialization}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="text-3xs text-muted-foreground font-semibold uppercase tracking-wider space-y-1.5 pt-2 border-t border-border/40">
                    <div className="flex items-center gap-1.5">
                      <Award size={14} className="text-primary" />
                      <span>{doc.experience} Years Professional Experience</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign size={14} className="text-primary" />
                      <span>Consultation Fee: ${doc.fee}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star size={14} className="text-amber-500 fill-current" />
                      <span>
                        Rating: {doc.rating || 0} ({doc.ratingCount || 0} feedback reviews)
                      </span>
                    </div>
                  </div>

                  <Link href={`/doctors/${doc._id}`} className="block w-full mt-2">
                    <Button variant="primary" size="sm" className="w-full flex items-center justify-center gap-1.5">
                      <CalendarDays size={14} />
                      View Details & Book
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
