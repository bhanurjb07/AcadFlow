import React from 'react';
import { User, Shield, Lock } from 'lucide-react';

interface Seat {
  _id: string;
  row: number;
  column: number;
  seatNumber: string;
  isPermanent?: boolean;
  assignedStudentId?: any;
  allocatedStudent?: any;
}

interface SeatMapProps {
  seats: Seat[];
  rows: number;
  columns: number;
  onSeatClick?: (seat: Seat) => void;
  selectedSeatId?: string | null;
  highlightStudentId?: string | null;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  seats,
  rows,
  columns,
  onSeatClick,
  selectedSeatId,
  highlightStudentId,
}) => {
  // Create a 2D matrix
  const matrix: (Seat | null)[][] = Array.from({ length: rows }, () =>
    Array(columns).fill(null)
  );

  seats.forEach((seat) => {
    if (seat.row <= rows && seat.column <= columns) {
      matrix[seat.row - 1][seat.column - 1] = seat;
    }
  });

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Teacher Podium / Whiteboard Indicator */}
      <div className="w-full max-w-lg py-2.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-900/60 via-slate-800/80 to-indigo-900/60 border border-indigo-500/30 text-center shadow-lg shadow-indigo-950/40">
        <span className="text-xs font-bold tracking-widest text-indigo-300 uppercase">
          ✦ TEACHER PODIUM / BOARD ✦
        </span>
      </div>

      {/* Seat Grid */}
      <div
        className="grid gap-3 p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-2xl overflow-x-auto max-w-full"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(90px, 1fr))`,
        }}
      >
        {matrix.map((row, rIdx) =>
          row.map((seat, cIdx) => {
            if (!seat) {
              return (
                <div
                  key={`empty-${rIdx}-${cIdx}`}
                  className="h-20 rounded-xl border border-dashed border-slate-800/60 bg-slate-950/30 flex items-center justify-center"
                >
                  <span className="text-[10px] text-slate-600">Empty</span>
                </div>
              );
            }

            const student = seat.allocatedStudent;
            const isSelected = selectedSeatId === seat._id;
            const isHighlighted =
              highlightStudentId &&
              (student?._id === highlightStudentId ||
                seat.assignedStudentId === highlightStudentId);

            return (
              <button
                key={seat._id}
                onClick={() => onSeatClick && onSeatClick(seat)}
                className={`relative group flex flex-col items-center justify-between p-2 h-24 rounded-xl border transition-all duration-200 ${
                  isHighlighted
                    ? 'border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400'
                    : isSelected
                    ? 'border-indigo-400 bg-indigo-600/30 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-400'
                    : student
                    ? 'border-indigo-500/30 bg-slate-800/80 hover:border-indigo-400/60'
                    : 'border-slate-700/50 bg-slate-900/40 hover:border-slate-600'
                }`}
              >
                {/* Header: Seat number + permanent badge */}
                <div className="w-full flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-300">{seat.seatNumber}</span>
                  {seat.isPermanent && (
                    <span title="Permanent Seat">
                      <Lock className="h-3 w-3 text-amber-400" />
                    </span>
                  )}
                </div>

                {/* Body: Student avatar or Empty */}
                <div className="flex flex-col items-center justify-center my-auto">
                  {student ? (
                    <>
                      <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
                        {student.name ? student.name[0] : 'S'}
                      </div>
                      <span className="text-[11px] font-medium text-slate-200 mt-1 max-w-[80px] truncate">
                        {student.name}
                      </span>
                      <span className="text-[9px] text-indigo-400">
                        {student.rollNumber || student.studentId}
                      </span>
                    </>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-medium">Available</span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 pt-2">
        <div className="flex items-center space-x-2">
          <div className="h-3.5 w-3.5 rounded bg-slate-800 border border-indigo-500/40"></div>
          <span>Allocated</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-3.5 w-3.5 rounded bg-slate-900 border border-slate-700"></div>
          <span>Empty</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-3.5 w-3.5 rounded bg-emerald-500/30 border border-emerald-400"></div>
          <span>Your Seat</span>
        </div>
        <div className="flex items-center space-x-2">
          <Lock className="h-3.5 w-3.5 text-amber-400" />
          <span>Permanent Assignment</span>
        </div>
      </div>
    </div>
  );
};
