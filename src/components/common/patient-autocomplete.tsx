"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Patient } from "@/types/patient";
import { cn } from "@/lib/utils";

interface PatientAutocompleteProps {
  patients: Patient[];
  value?: string;
  onChange: (patientName: string, patientId?: number) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function PatientAutocomplete({
  patients,
  value = "",
  onChange,
  placeholder = "Buscar paciente...",
  disabled = false,
}: PatientAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrar pacientes baseado no termo de busca
  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Atualizar searchTerm quando value mudar externamente
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleSelectPatient = (patient: Patient) => {
    setSearchTerm(patient.name);
    onChange(patient.name, patient.id);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && e.key !== "Escape") {
      setIsOpen(true);
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredPatients.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredPatients[highlightedIndex]) {
          handleSelectPatient(filteredPatients[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full"
      />
      {isOpen && filteredPatients.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredPatients.map((patient, index) => (
            <div
              key={patient.id}
              onClick={() => handleSelectPatient(patient)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                "px-4 py-2 cursor-pointer hover:bg-gray-100",
                highlightedIndex === index && "bg-gray-100"
              )}
            >
              {patient.name}
            </div>
          ))}
        </div>
      )}
      {isOpen && searchTerm && filteredPatients.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="px-4 py-2 text-gray-500">
            Nenhum paciente encontrado
          </div>
        </div>
      )}
    </div>
  );
}

