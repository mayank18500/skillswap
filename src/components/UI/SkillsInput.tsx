import React, { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

export interface SkillsInputProps {
  selected: string[];
  onChange: (skills: string[]) => void;
  options: string[];
  placeholder: string;
  className?: string;
  maxSuggestions?: number;
}

export const SkillsInput: React.FC<SkillsInputProps> = ({
  selected,
  onChange,
  options,
  placeholder,
  className = '',
  maxSuggestions = 8
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = options
        .filter(
          (suggestion) =>
            suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
            !selected.some((skill) => skill.toLowerCase() === suggestion.toLowerCase())
        )
        .slice(0, maxSuggestions);
      setFilteredSuggestions(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      const availableSuggestions = options
        .filter(
          (suggestion) =>
            !selected.some((skill) => skill.toLowerCase() === suggestion.toLowerCase())
        )
        .slice(0, maxSuggestions);
      setFilteredSuggestions(availableSuggestions);
      setIsOpen(false);
    }
    setHighlightedIndex(-1);
  }, [inputValue, options, selected, maxSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputFocus = () => {
    if (!inputValue.trim()) {
      const availableSuggestions = options
        .filter(
          (suggestion) =>
            !selected.some((skill) => skill.toLowerCase() === suggestion.toLowerCase())
        )
        .slice(0, maxSuggestions);
      setFilteredSuggestions(availableSuggestions);
      setIsOpen(availableSuggestions.length > 0);
    }
  };

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (
      trimmedSkill &&
      !selected.some((s) => s.toLowerCase() === trimmedSkill.toLowerCase())
    ) {
      onChange([...selected, trimmedSkill]);
      setInputValue('');
      setIsOpen(false);
      inputRef.current?.focus();
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(selected.filter((skill) => skill !== skillToRemove));
  };

  const handleSuggestionClick = (suggestion: string) => {
    addSkill(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
        addSkill(filteredSuggestions[highlightedIndex]);
      } else if (inputValue.trim()) {
        addSkill(inputValue);
      }
      return;
    }

    if (e.key === 'Backspace' && !inputValue && selected.length > 0) {
      removeSkill(selected[selected.length - 1]);
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative">
      <div
        className={`min-h-[42px] border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200 ${className}`}
      >
        <div className="flex flex-wrap gap-2 items-center">
          {selected.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-2 text-blue-500 hover:text-blue-700 transition-colors duration-150"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={selected.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] outline-none bg-transparent"
            autoComplete="off"
          />
        </div>
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-150 flex items-center justify-between ${
                index === highlightedIndex
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-900'
              } ${index === 0 ? 'rounded-t-lg' : ''} ${
                index === filteredSuggestions.length - 1
                  ? 'rounded-b-lg'
                  : 'border-b border-gray-100'
              }`}
            >
              <span className="text-sm font-medium">{suggestion}</span>
              <Plus className="w-4 h-4 text-gray-400" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
