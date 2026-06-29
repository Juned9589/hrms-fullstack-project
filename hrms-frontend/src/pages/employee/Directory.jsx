import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDirectoryApi } from '../../api/employee.api';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Input from '../../components/ui/Input';
import useDebounce from '../../hooks/useDebounce';
import { Search, Mail, Phone } from 'lucide-react';

export default function Directory() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: directory, isLoading } = useQuery({
    queryKey: ['directory', debouncedSearch],
    queryFn: () => getDirectoryApi({ search: debouncedSearch }),
  });

  const cards = directory?.employees || [];

  return (
    <div className="animate-fadeInUp space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 leading-tight">
          Employee Directory
        </h2>
        <p className="text-slate-500 text-sm mt-1">Locate and communicate with team members across departments.</p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search name, department, or designation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/70 border border-white/70 focus:border-[#2563EB] focus:outline-none rounded-xl h-10 text-xs pl-10 pr-3 text-slate-950 shadow-sm"
        />
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
      </div>

      {isLoading ? (
        <Spinner fullPage />
      ) : cards.length === 0 ? (
        <p className="text-xs text-slate-400 py-12 text-center">No directory results match your search query.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {cards.map((employee) => (
            <div
              key={employee.id}
              onClick={() => window.location.href = `/employees/${employee.id}`}
              className="bg-white/70 border border-white/70 rounded-2xl p-6 text-center cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:shadow-md transition-all duration-200"
            >
              <Avatar name={employee.name} photo={employee.photo} size="lg" className="mx-auto" />
              <h3 className="text-base font-semibold text-slate-950 mt-4">{employee.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{employee.designationName}</p>
              <div className="mt-3 flex justify-center">
                <Badge label={employee.departmentName} variant="info" />
              </div>

              <div className="flex justify-center gap-3 mt-6 pt-4 border-t border-white/70">
                <a
                  href={`mailto:${employee.officialEmail}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-xl hover:bg-white/70 text-slate-400 hover:text-slate-950 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                </a>
                {employee.phone && (
                  <a
                    href={`tel:${employee.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-xl hover:bg-white/70 text-slate-400 hover:text-slate-950 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
