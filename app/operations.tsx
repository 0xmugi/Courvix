"use client";
import {
  Users,
  ArrowUpRight,
  Plus,
  CalendarDays,
  MapPin,
  Clock,
  GraduationCap,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { type Row, money } from "@/lib/courvix";

export function TeamsView({
  teams,
  members,
  canEdit,
  create,
  open,
}: {
  teams: Row[];
  members: Row[];
  canEdit: boolean;
  create: () => void;
  open: (row: Row) => void;
}) {
  return (
    <>
      <div className="toolbar">
        <p className="hint">
          {teams.length} teams · Built around your sport and your people.
        </p>
        {canEdit && (
          <button className="btn primary" onClick={create}>
            <Plus size={16} />
            Create team
          </button>
        )}
      </div>
      <div className="team-grid">
        {teams.map((team, i) => (
          <article className="panel team-card" key={team.id}>
            <div className="team-card-top">
              <span className={"team-symbol team-" + (i % 3)}>
                <Users size={25} />
              </span>
              <span className="tag">{team.sport}</span>
            </div>
            <h2>{team.name}</h2>
            <p>
              <GraduationCap size={15} />
              {team.coach || "Coach belum ditugaskan"}
            </p>
            <div className="roster-avatars">
              {members
                .filter((m) => m.team === team.id)
                .slice(0, 4)
                .map((m) => (
                  <span className="avatar" key={m.id}>
                    {m.name
                      .split(" ")
                      .slice(0, 2)
                      .map((s: string) => s[0])
                      .join("")}
                  </span>
                ))}
              <small>
                {members.filter((m) => m.team === team.id).length} members
              </small>
            </div>
            <button className="text-btn" onClick={() => open(team)}>
              Open team workspace <ArrowUpRight size={16} />
            </button>
          </article>
        ))}
      </div>
      {!teams.length && (
        <div className="empty">
          <Users />
          <h3>Belum ada tim</h3>
          <p>Buat tim pertama untuk menyusun roster klub.</p>
        </div>
      )}
    </>
  );
}
export function CalendarView({
  sessions,
  create,
  open,
  canEdit,
}: {
  sessions: Row[];
  create: () => void;
  open: (r: Row) => void;
  canEdit: boolean;
}) {
  return (
    <>
      <div className="toolbar">
        <CalendarDays size={22} />
        <h2>September 2026</h2>
        <span className="hint">WIB · demo season</span>
        {canEdit && (
          <button className="btn primary" onClick={create}>
            <Plus size={16} />
            Schedule session
          </button>
        )}
      </div>
      <Tabs defaultValue="month">
        <TabsList>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
        </TabsList>
        <TabsContent value="month">
          <div className="panel calendar-wrap">
            <div className="calendar-grid day-names">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="calendar-grid">
              <div className="calendar-cell outside">31</div>
              {Array.from({ length: 30 }, (_, i) => {
                const date = "2026-09-" + String(i + 1).padStart(2, "0");
                return (
                  <div
                    className={"calendar-cell " + (i === 22 ? "current" : "")}
                    key={date}
                  >
                    <b>{i + 1}</b>
                    {sessions
                      .filter((s) => s.date === date)
                      .map((s) => (
                        <button key={s.id} onClick={() => open(s)}>
                          <time>{s.time}</time>
                          <strong>{s.name}</strong>
                        </button>
                      ))}
                  </div>
                );
              })}
              {[1, 2, 3, 4].map((d) => (
                <div className="calendar-cell outside" key={d}>
                  {d}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="agenda">
          <div className="panel agenda">
            {sessions.map((s) => (
              <button key={s.id} onClick={() => open(s)}>
                <span className="date-tile">
                  <small>SEP</small>
                  <b>{s.date.slice(-2)}</b>
                </span>
                <span>
                  <h3>{s.name}</h3>
                  <p>
                    <Clock size={13} />
                    {s.time} WIB <MapPin size={13} />
                    {s.venue}
                  </p>
                </span>
                <ArrowUpRight size={16} />
              </button>
            ))}
            {!sessions.length && (
              <div className="empty">
                Tidak ada sesi. Buat jadwal pertama untuk klub ini.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
export function MemberDetails({
  member,
  team,
  attendance,
  invoices,
  audit,
  financial,
}: {
  member: Row;
  team?: Row;
  attendance: Row[];
  invoices: Row[];
  audit: Row[];
  financial: boolean;
}) {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="attendance">Attendance</TabsTrigger>
        {financial && <TabsTrigger value="payments">Payments</TabsTrigger>}
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <div className="breakdown">
          {[
            ["Nama", member.name],
            ["Email", member.email],
            ["Tim", team?.name || "Belum ditugaskan"],
            ["Status", member.status],
            ["Bergabung", member.date],
          ].map(([k, v]) => (
            <p key={k}>
              <span>{k}</span>
              <b>{v}</b>
            </p>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="attendance">
        {attendance.length ? (
          <div className="breakdown">
            {attendance.map((a) => (
              <p key={a.id}>
                <span>{a.date}</span>
                <b>{a.status}</b>
              </p>
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>Belum ada kehadiran tercatat</h3>
            <p>Kehadiran akan muncul setelah coach mencatat sesi.</p>
          </div>
        )}
      </TabsContent>
      {financial && (
        <TabsContent value="payments">
          {invoices.length ? (
            <div className="breakdown">
              {invoices.map((i) => (
                <p key={i.id}>
                  <span>
                    {i.description || i.id}
                    <br />
                    {i.status}
                  </span>
                  <b>{money(i.amount)}</b>
                </p>
              ))}
            </div>
          ) : (
            <div className="empty">Belum ada tagihan anggota.</div>
          )}
        </TabsContent>
      )}
      <TabsContent value="activity">
        <div className="breakdown">
          <p>
            <span>{member.date}</span>
            <b>Bergabung ke klub</b>
          </p>
          {audit
            .filter((a) => a.name?.includes(member.name))
            .map((a) => (
              <p key={a.id}>
                <span>{a.date.slice(0, 10)}</span>
                <b>{a.name}</b>
              </p>
            ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
