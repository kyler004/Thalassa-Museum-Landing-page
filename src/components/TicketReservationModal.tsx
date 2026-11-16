import React, { useState } from 'react';
import { X, Check, ArrowRight, Calendar, Clock, Users } from 'lucide-react';

interface TicketReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedExhibitTitle?: string;
}

const TIERS = [
  {
    id: 'general',
    name: 'General Pavilion Entry',
    price: '€18',
    detail: 'Full access to the 5 Peristyle Galleries, Reflecting Court & Digital Archive',
  },
  {
    id: 'scholar',
    name: 'Curatorial & Archive Pass',
    price: '€32',
    detail: 'Includes access to the Study Room, Cycladic Drawing Collection & Exhibition Monograph',
  },
  {
    id: 'private',
    name: 'Architect-Led Twilight Tour',
    price: '€65',
    detail: 'Small-group evening study of solar geometry and chiaroscuro lighting across all bays',
  },
];

const TIME_SLOTS = ['10:00', '11:30', '13:30', '15:30', '17:30'];

export const TicketReservationModal: React.FC<TicketReservationModalProps> = ({
  isOpen,
  onClose,
  initialSelectedExhibitTitle,
}) => {
  const [selectedTier, setSelectedTier] = useState(TIERS[0].id);
  const [selectedDate, setSelectedDate] = useState('2026-11-18');
  const [selectedTime, setSelectedTime] = useState('11:30');
  const [guests, setGuests] = useState(2);
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [passCode, setPassCode] = useState('');

  if (!isOpen) return null;

  const activeTierObj = TIERS.find((t) => t.id === selectedTier) || TIERS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setPassCode(`THL-${randomNum}-SYR`);
    setIsConfirmed(true);
  };

  const handleReset = () => {
    setIsConfirmed(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/75 p-4 md:p-8 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reservation-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-[#FAF9F6] text-[#111111] border border-[#111111] p-8 md:p-12 shadow-2xl my-auto">
        <button
          onClick={onClose}
          aria-label="Close reservation dialog"
          className="absolute top-6 right-6 w-11 h-11 flex items-center justify-center border border-[#D6D3CB] hover:border-[#111111] hover:bg-[#111111] hover:text-[#FAF9F6] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {!isConfirmed ? (
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#666662] mb-3">
              <span>TIMED PAVILION ENTRY</span>
              <span aria-hidden="true">·</span>
              <span>SYROS & ATHENS ARCHIVE</span>
            </div>

            <h2
              id="reservation-modal-title"
              className="font-display text-2xl md:text-3xl font-normal tracking-tight text-[#111111] mb-2"
            >
              Reserve Museum Admission
            </h2>

            {initialSelectedExhibitTitle && (
              <p className="font-cursive italic text-lg text-[#52524E] mb-6">
                Including curatorial focus on “{initialSelectedExhibitTitle}”
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              {/* Tier Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#52524E]">
                  01. Select Admission Category
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {TIERS.map((tier) => {
                    const active = tier.id === selectedTier;
                    return (
                      <button
                        type="button"
                        key={tier.id}
                        onClick={() => setSelectedTier(tier.id)}
                        className={`text-left p-4 border transition-colors flex items-start justify-between gap-4 ${
                          active
                            ? 'border-[#111111] bg-[#111111] text-[#FAF9F6]'
                            : 'border-[#D6D3CB] bg-white text-[#111111] hover:border-[#111111]'
                        }`}
                      >
                        <div>
                          <div className="font-display font-medium text-sm">
                            {tier.name}
                          </div>
                          <div
                            className={`text-xs mt-1 leading-relaxed ${
                              active ? 'text-[#D6D3CB]' : 'text-[#666662]'
                            }`}
                          >
                            {tier.detail}
                          </div>
                        </div>
                        <span className="font-mono text-sm font-medium shrink-0">
                          {tier.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date, Time & Guests */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#E5E4DE]">
                <div>
                  <label
                    htmlFor="visit-date"
                    className="flex items-center gap-1.5 text-xs font-mono text-[#52524E] mb-2"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>DATE</span>
                  </label>
                  <input
                    id="visit-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                    className="w-full h-11 px-3 bg-white border border-[#D6D3CB] text-sm font-mono focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-mono text-[#52524E] mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>SOLAR SLOT</span>
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-[#D6D3CB] text-sm font-mono focus:outline-none focus:border-[#111111]"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot} EET
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-mono text-[#52524E] mb-2">
                    <Users className="w-3.5 h-3.5" />
                    <span>VISITORS</span>
                  </label>
                  <div className="flex items-center h-11 border border-[#D6D3CB] bg-white">
                    <button
                      type="button"
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-11 h-full flex items-center justify-center hover:bg-[#F1F0EC] font-mono"
                    >
                      −
                    </button>
                    <span className="flex-1 text-center font-mono text-sm">
                      {guests}
                    </span>
                    <button
                      type="button"
                      onClick={() => setGuests(Math.min(10, guests + 1))}
                      className="w-11 h-full flex items-center justify-center hover:bg-[#F1F0EC] font-mono"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Visitor Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#E5E4DE]">
                <div>
                  <label
                    htmlFor="visitor-name"
                    className="block text-xs font-mono text-[#52524E] mb-2"
                  >
                    FULL NAME
                  </label>
                  <input
                    id="visitor-name"
                    type="text"
                    required
                    placeholder="Elena Papadopoulos"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="w-full h-11 px-3.5 bg-white border border-[#D6D3CB] text-sm focus:outline-none focus:border-[#111111]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="visitor-email"
                    className="block text-xs font-mono text-[#52524E] mb-2"
                  >
                    EMAIL FOR DIGITAL PASS
                  </label>
                  <input
                    id="visitor-email"
                    type="email"
                    required
                    placeholder="elena@archive.gr"
                    value={visitorEmail}
                    onChange={(e) => setVisitorEmail(e.target.value)}
                    className="w-full h-11 px-3.5 bg-white border border-[#D6D3CB] text-sm focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-[#52524E]">
                  <span>{activeTierObj.name}</span>
                  <span className="mx-1.5">·</span>
                  <span className="font-mono text-[#111111] font-medium">
                    {guests} × {activeTierObj.price}
                  </span>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3.5 bg-[#111111] text-[#FAF9F6] text-xs font-mono tracking-widest uppercase hover:bg-[#2B2B28] transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                >
                  <span>Confirm Timed Pass</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="py-4 space-y-6">
            <div className="flex items-center gap-3 text-[#111111]">
              <div className="w-8 h-8 border border-[#111111] flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono tracking-widest uppercase">
                Reservation Recorded in Pavilion Registry
              </span>
            </div>

            <h3 className="font-display text-3xl font-normal tracking-tight">
              Your Timed Entry Pass is Ready
            </h3>

            {/* Printable Monochrome Archival Ticket Stub */}
            <div className="border border-[#111111] bg-white p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E4DE] pb-4">
                <div>
                  <div className="font-display text-lg font-medium">
                    Thalassa Museum of Mediterranean Form
                  </div>
                  <div className="text-xs text-[#666662]">
                    North Peristyle & Central Oculus Pavilion
                  </div>
                </div>
                <div className="text-right font-mono text-xs">
                  <div className="text-[#666662]">PASS REF</div>
                  <div className="font-medium text-[#111111]">{passCode}</div>
                </div>
              </div>

              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <dt className="text-[#666662] font-mono mb-1">GUEST</dt>
                  <dd className="font-medium">{visitorName || 'Registered Visitor'}</dd>
                </div>
                <div>
                  <dt className="text-[#666662] font-mono mb-1">DATE</dt>
                  <dd className="font-mono">{selectedDate}</dd>
                </div>
                <div>
                  <dt className="text-[#666662] font-mono mb-1">ENTRY TIME</dt>
                  <dd className="font-mono">{selectedTime} EET</dd>
                </div>
                <div>
                  <dt className="text-[#666662] font-mono mb-1">PARTY SIZE</dt>
                  <dd className="font-mono">{guests} Admitted</dd>
                </div>
              </dl>

              <div className="pt-3 border-t border-[#E5E4DE] flex items-center justify-between text-xs font-mono text-[#52524E]">
                <span>TIER: {activeTierObj.name.toUpperCase()}</span>
                <span>STATUS: CONFIRMED</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-[#111111] text-[#FAF9F6] text-xs font-mono tracking-widest uppercase hover:bg-[#2B2B28] transition-colors whitespace-nowrap shrink-0"
              >
                Return to Exhibition
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
