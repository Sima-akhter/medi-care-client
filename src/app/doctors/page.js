"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/Card";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import Skeleton, { SkeletonCards } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import Table, { TableRow, TableCell } from "@/components/Table";
import { apiRequest } from "@/lib/api-client";
import { 
  Stethoscope, 
  Star, 
  Award, 
  DollarSign, 
  Search, 
  CalendarDays,
  LayoutGrid,
  TableProperties
} from "lucide-react";
import Footer from "@/components/Footer";

export default function FindDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter States
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [order, setOrder] = useState("");
  
  // Pagination States
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);

  // Layout State (Card vs Table)
  const [layout, setLayout] = useState("grid");

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      let url = `/doctors?status=approved&page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (specialtyFilter) url += `&specialization=${encodeURIComponent(specialtyFilter)}`;
      if (sortBy) {
        url += `&sortBy=${sortBy}`;
        if (order) url += `&order=${order}`;
      }
      
      const res = await apiRequest(url);
      if (res.success) {
        setDoctors(res.data || []);
        setTotalPages(res.pages || 1);
        setTotalDoctors(res.total || 0);
      }
    } catch (err) {
      console.error("Failed to query doctor records:", err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced execution for search input and immediate for dropdown filters
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchDoctors();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, specialtyFilter, sortBy, order, page]);

  const handleSortChange = (e) => {
    const val = e.target.value;
    if (val === "") {
      setSortBy("");
      setOrder("");
    } else if (val === "fee_asc") {
      setSortBy("fee");
      setOrder("asc");
    } else if (val === "fee_desc") {
      setSortBy("fee");
      setOrder("desc");
    } else if (val === "experience_desc") {
      setSortBy("experience");
      setOrder("desc");
    } else if (val === "experience_asc") {
      setSortBy("experience");
      setOrder("asc");
    } else if (val === "rating_desc") {
      setSortBy("rating");
      setOrder("desc");
    }
    setPage(1);
  };

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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-150">
      <PublicNavbar />

      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full space-y-8">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Directory</span>
          <h1 className="text-2xl font-black text-foreground mt-1">Find Doctors & Specialists</h1>
          <p className="text-xs text-muted-foreground">Browse through certified and approved medical practitioners</p>
        </div>

        {/* SEARCH, FILTERS & LAYOUT PANEL */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-card border border-border p-4 rounded-xs">
          {/* Advanced Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search doctors by name or specialization..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-background border border-border rounded-xs pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="flex flex-wrap w-full md:w-auto gap-4 items-center justify-between sm:justify-start">
            {/* Specialization Filter Dropdown */}
            <select
              value={specialtyFilter}
              onChange={(e) => {
                setSpecialtyFilter(e.target.value);
                setPage(1);
              }}
              className="bg-background border border-border rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all cursor-pointer w-full sm:w-48"
            >
              <option value="">All Specializations</option>
              {specialties.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>

            {/* Sorting Dropdown */}
            <select
              onChange={handleSortChange}
              className="bg-background border border-border rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all cursor-pointer w-full sm:w-48"
            >
              <option value="">Sort By (Default)</option>
              <option value="fee_asc">Fee: Low to High</option>
              <option value="fee_desc">Fee: High to Low</option>
              <option value="experience_desc">Experience: High to Low</option>
              <option value="experience_asc">Experience: Low to High</option>
              <option value="rating_desc">Highest Rating</option>
            </select>

            {/* Layout Changer Toggle Button */}
            <div className="flex gap-1 border border-border rounded-xs p-1 bg-background shrink-0">
              <button
                onClick={() => setLayout("grid")}
                className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
                  layout === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
                title="Grid Card Layout"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setLayout("table")}
                className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
                  layout === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
                title="Table List Layout"
              >
                <TableProperties size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* RESULTS METRICS */}
        {!loading && (
          <p className="text-3xs font-bold uppercase tracking-wider text-muted-foreground">
            Showing {doctors.length} of {totalDoctors} approved specialists
          </p>
        )}

        {/* DATA CONTAINER */}
        {loading ? (
          <SkeletonCards />
        ) : doctors.length === 0 ? (
          <EmptyState 
            title="No Doctors Found" 
            description="We couldn't find any approved specialists matching your search queries or filters." 
            icon={Stethoscope}
          />
        ) : layout === "grid" ? (
          /* CARD GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {doctors.map((doc) => {
              const displayName = doc.name || doc.doctorName || "Doctor";
              const displayImage = doc.profileImage || doc.image;
              const displayFee = doc.consultationFee !== undefined ? doc.consultationFee : doc.fee;
              const displayReviews = doc.ratingCount !== undefined ? doc.ratingCount : (doc.totalReviews || 0);

              return (
                <Card key={doc._id} className="flex flex-col justify-between hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3 flex flex-row items-center gap-4">
                    <div className="shrink-0">
                      {displayImage ? (
                        <img
                          src={displayImage}
                          alt={displayName}
                          className="w-16 h-16 object-cover border border-border rounded-xs"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black text-lg rounded-xs">
                          {displayName[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-foreground">{displayName}</CardTitle>
                      <Badge variant="success" className="mt-1">
                        {doc.specialization}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <div className="text-3xs text-muted-foreground font-semibold uppercase tracking-wider space-y-1.5 pt-2 border-t border-border/40">
                      <div className="flex items-center gap-1.5">
                        <Award size={14} className="text-primary" />
                        <span>{doc.experience} Years Experience</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign size={14} className="text-primary" />
                        <span>Consultation Fee: ${displayFee}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Star size={14} className="text-amber-500 fill-current" />
                        <span>
                          Rating: {doc.rating || 0} ({displayReviews} feedback)
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
              );
            })}
          </div>
        ) : (
          /* TABLE VIEW LAYOUT */
          <Table headers={["Doctor Name", "Specialization", "Experience", "Fee", "Rating Score", "Actions"]}>
            {doctors.map((doc) => {
              const displayName = doc.name || doc.doctorName || "Doctor";
              const displayFee = doc.consultationFee !== undefined ? doc.consultationFee : doc.fee;
              const displayReviews = doc.ratingCount !== undefined ? doc.ratingCount : (doc.totalReviews || 0);

              return (
                <TableRow key={doc._id}>
                  <TableCell className="font-semibold text-foreground">{displayName}</TableCell>
                  <TableCell>
                    <Badge variant="success">{doc.specialization}</Badge>
                  </TableCell>
                  <TableCell className="text-xs font-semibold">{doc.experience} Years</TableCell>
                  <TableCell className="font-bold text-foreground">${displayFee}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-xs font-bold text-foreground">
                      <Star size={13} className="text-amber-500 fill-current" />
                      {doc.rating || 0} ({displayReviews})
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link href={`/doctors/${doc._id}`}>
                      <Button variant="primary" size="sm" className="flex items-center gap-1">
                        Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        )}

        {/* SERVER PAGINATION ACTIONS */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-xs border transition-colors cursor-pointer ${
                  page === p
                    ? "bg-primary border-primary text-primary-foreground font-black"
                    : "bg-background border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {p}
              </button>
            ))}

            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            >
              Next
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
