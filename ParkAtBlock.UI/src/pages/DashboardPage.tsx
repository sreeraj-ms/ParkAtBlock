import { Car, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ParkingSlotCard } from "../components/ParkingSlotCard";
import { ParkingSummary } from "../components/ParkingSummary";
import { useParking } from "../context/ParkingContext";
import type { ParkingSlotState } from "../models/parking";

type Filter = "All" | "Available" | "Occupied" | "Offline";
type Sort = "slot" | "available" | "occupied" | "offline";
type BuildingId = "A" | "B" | "C";

type LayoutBay = {
  slotId: number;
  column: number;
  row: number;
  side: "left" | "right";
};
type BuildingLayout = {
  id: BuildingId;
  name: string;
  subtitle: string;
  columns: number;
  rows: number;
  bays: LayoutBay[];
};

const buildingLayouts: BuildingLayout[] = [
  {
    id: "A",
    name: "Thejaswini",
    subtitle: "Basement level -3",
    columns: 7,
    rows: 7,
    bays: [
      { slotId: 1, column: 1, row: 1, side: "left" },
      { slotId: 2, column: 1, row: 3, side: "left" },
      { slotId: 3, column: 1, row: 5, side: "left" },
      { slotId: 4, column: 7, row: 2, side: "right" },
      { slotId: 5, column: 7, row: 4, side: "right" },
      { slotId: 6, column: 7, row: 6, side: "right" },
    ],
  },
  {
    id: "B",
    name: "Yamuna",
    subtitle: "Ground level parking",
    columns: 9,
    rows: 6,
    bays: [
      { slotId: 1, column: 1, row: 1, side: "left" },
      { slotId: 2, column: 3, row: 1, side: "left" },
      { slotId: 3, column: 5, row: 1, side: "left" },
      { slotId: 4, column: 7, row: 1, side: "left" },
      { slotId: 5, column: 2, row: 6, side: "right" },
      { slotId: 6, column: 4, row: 6, side: "right" },
      { slotId: 7, column: 6, row: 6, side: "right" },
      { slotId: 8, column: 8, row: 6, side: "right" },
    ],
  },
  {
    id: "C",
    name: "M Square",
    subtitle: "Tower C · Level P2",
    columns: 8,
    rows: 8,
    bays: [
      { slotId: 1, column: 1, row: 1, side: "left" },
      { slotId: 2, column: 1, row: 3, side: "left" },
      { slotId: 3, column: 1, row: 5, side: "left" },
      { slotId: 4, column: 1, row: 7, side: "left" },
      { slotId: 5, column: 8, row: 2, side: "right" },
      { slotId: 6, column: 8, row: 4, side: "right" },
      { slotId: 7, column: 8, row: 6, side: "right" },
      { slotId: 8, column: 8, row: 8, side: "right" },
    ],
  },
];

function slotStatus(slot?: ParkingSlotState) {
  if (!slot) return "unassigned";
  return slot.deviceStatus === "Offline"
    ? "offline"
    : slot.isOccupied
      ? "occupied"
      : "available";
}

function statusLabel(status: string) {
  return status === "available"
    ? "Available"
    : status === "occupied"
      ? "Parked"
      : status === "unassigned"
        ? "No sensor"
        : "Offline";
}

export function DashboardPage() {
  const { slots, loading, error, loadSlots } = useParking();
  const [filter, setFilter] = useState<Filter>("All");
  const [sort, setSort] = useState<Sort>("slot");
  const [search, setSearch] = useState("");
  const [buildingId, setBuildingId] = useState<BuildingId>("A");
  const previousStatuses = useRef<Record<number, string>>({});
  const filteredSlots = useMemo(
    () =>
      slots
        .filter((slot) => {
          const status =
            slot.deviceStatus === "Offline"
              ? "Offline"
              : slot.isOccupied
                ? "Occupied"
                : "Available";
          return (
            (filter === "All" || status === filter) &&
            (`${slot.slotId}`.includes(search) ||
              slot.deviceId.toLowerCase().includes(search.toLowerCase()))
          );
        })
        .sort((a, b) =>
          sort === "slot"
            ? a.slotId - b.slotId
            : sort === "available"
              ? Number(a.isOccupied) - Number(b.isOccupied)
              : sort === "occupied"
                ? Number(b.isOccupied) - Number(a.isOccupied)
                : Number(b.deviceStatus === "Offline") -
                  Number(a.deviceStatus === "Offline"),
        ),
    [slots, filter, sort, search],
  );
  const building =
    buildingLayouts.find((item) => item.id === buildingId) ??
    buildingLayouts[0];
  const visibleSlotIds = new Set(filteredSlots.map((slot) => slot.slotId));
  const slotsById = new Map(slots.map((slot) => [slot.slotId, slot]));
  useEffect(() => {
    previousStatuses.current = Object.fromEntries(
      slots.map((slot) => [slot.slotId, slotStatus(slot)]),
    );
  }, [slots]);

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Live operations</p>
          <h1>Parking overview</h1>
          <p className="page-intro">A live view of every monitored space.</p>
        </div>
        <span className="last-sync">Updates stream live</span>
      </div>
      <ParkingSummary slots={slots} />
      {error && (
        <div className="alert" role="alert">
          <span>{error}</span>
          <button onClick={() => void loadSlots()}>Retry</button>
        </div>
      )}
      <div className="section-heading">
        <div>
          <h2>Parking layout</h2>
          <span>
            {filteredSlots.length} of {slots.length} spaces visible
          </span>
        </div>
        <div className="slot-controls">
          <label className="search-box">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Search slots or devices</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search slot or device"
            />
          </label>
          <label className="sort-box">
            <SlidersHorizontal size={16} aria-hidden="true" />
            <span className="sr-only">Sort slots</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as Sort)}
            >
              <option value="slot">Slot number</option>
              <option value="available">Available first</option>
              <option value="occupied">Occupied first</option>
              <option value="offline">Offline first</option>
            </select>
          </label>
        </div>
      </div>
      <div className="filters" role="tablist" aria-label="Filter parking slots">
        {(["All", "Available", "Occupied", "Offline"] as Filter[]).map(
          (option) => (
            <button
              className={filter === option ? "active" : ""}
              key={option}
              onClick={() => setFilter(option)}
              role="tab"
              aria-selected={filter === option}
            >
              {option}
            </button>
          ),
        )}
      </div>
      <div
        className="building-tabs"
        role="tablist"
        aria-label="Choose building"
      >
        {buildingLayouts.map((item) => (
          <button
            className={buildingId === item.id ? "active" : ""}
            key={item.id}
            onClick={() => setBuildingId(item.id)}
            role="tab"
            aria-selected={buildingId === item.id}
          >
            <strong>Building {item.id}</strong>
            <span>{item.name}</span>
          </button>
        ))}
      </div>
      {loading ? (
        <div className="layout-skeleton" />
      ) : (
        <div className="parking-layout-wrap">
          <div className="layout-heading">
            <div>
              <span className="layout-kicker">Selected building</span>
              <h3>{building.name}</h3>
              <p>{building.subtitle}</p>
            </div>
            <div className="layout-legend">
              <span>
                <i className="legend-dot available" /> Available
              </span>
              <span>
                <i className="legend-dot occupied" /> Parked
              </span>
              <span>
                <i className="legend-dot offline" /> Offline
              </span>
            </div>
          </div>
          <div
            className={`parking-layout layout-${building.id.toLowerCase()}`}
            style={
              {
                "--layout-columns": building.columns,
                "--layout-rows": building.rows,
              } as React.CSSProperties
            }
          >
            <span className="entrance-label">Entry / exit</span>
            <div className="parking-aisle">
              <span>Drive aisle</span>
            </div>
            {building.bays.map((bay) => {
              const slot = slotsById.get(bay.slotId);
              const matchesFilter = visibleSlotIds.has(bay.slotId);
              const status = slotStatus(slot);
              const previousStatus = previousStatuses.current[bay.slotId];
              const motion =
                previousStatus === "available" && status === "occupied"
                  ? "motion-arriving"
                  : previousStatus === "occupied" && status === "available"
                    ? "motion-leaving"
                    : "";
              return (
                <a
                  className={`layout-bay bay-${bay.side} status-${status} ${motion} ${matchesFilter || (filter === "All" && !search) ? "" : "is-filtered"}`}
                  href={`/parking/${bay.slotId}`}
                  key={`${building.id}-${bay.slotId}`}
                  style={{ gridColumn: bay.column, gridRow: bay.row }}
                  aria-label={
                    slot
                      ? `View slot ${slot.slotId}, ${statusLabel(status)}`
                      : `Slot ${bay.slotId} has no sensor data`
                  }
                >
                  <span className="bay-number">
                    {String(bay.slotId).padStart(2, "0")}
                  </span>
                  <Car className="bay-car" size={50} aria-hidden="true" />
                  <span className="bay-state">
                    <i />
                    {statusLabel(status)}
                  </span>
                </a>
              );
            })}
          </div>
          <div className="layout-footer">
            <span>
              <strong>
                {
                  building.bays.filter((bay) => slotsById.has(bay.slotId))
                    .length
                }
              </strong>{" "}
              monitored bays
            </span>
            <span>Tap a bay for sensor details</span>
          </div>
        </div>
      )}
      {!loading && filteredSlots.length > 0 && (
        <div className="desktop-slot-list">
          <h2>Slot details</h2>
          <div className="slot-grid">
            {filteredSlots.map((slot) => (
              <ParkingSlotCard slot={slot} key={slot.slotId} />
            ))}
          </div>
        </div>
      )}
      {!loading && filteredSlots.length === 0 && (
        <div className="empty-state">
          <div>⌁</div>
          <h3>No parking slots match</h3>
          <p>Adjust the search or status filter to see monitored spaces.</p>
        </div>
      )}
    </section>
  );
}
