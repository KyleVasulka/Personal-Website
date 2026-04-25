"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import type { Project, ProjectSection } from "@/lib/projects";
import { projects, slugifyProjectName } from "@/lib/projects";

type DemoFilter = "all" | "with-demo" | "without-demo";
type TimelineSort = "newest" | "oldest";

type ProjectExplorerProps = {
  sections: ProjectSection[];
};

function getUniqueOptions(getValues: (project: Project) => string[]) {
  return Array.from(new Set(projects.flatMap(getValues))).sort((a, b) =>
    a.localeCompare(b),
  );
}

const techOptions = getUniqueOptions((project) => project.techStack);
const useCaseOptions = getUniqueOptions((project) => project.useCases);
const timelineOptions = getUniqueOptions((project) => [project.timeline]);

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className="filter-chip"
      data-active={active}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function ProjectCard({ item }: { item: Project }) {
  return (
    <article className="history-card" data-project-card>
      <div>
        <div className="project-card-topline">
          <span className="timeline-pill">{item.timeline}</span>
          <span className="demo-pill" data-has-demo={item.hasDemo}>
            {item.hasDemo ? "Demo" : "No demo listed"}
          </span>
        </div>
        <h4>
          <Link
            className="history-card-detail-link"
            href={`/projects/${slugifyProjectName(item.name)}`}
          >
            {item.name}
          </Link>
        </h4>
        <p>{item.description}</p>
      </div>

      <div className="project-tag-groups" aria-label={`${item.name} tags`}>
        <div className="project-tag-row" aria-label={`${item.name} tech stack`}>
          {item.techStack.map((tag) => (
            <span className="project-tag" data-tag-kind="tech" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <div className="project-tag-row" aria-label={`${item.name} use cases`}>
          {item.useCases.map((tag) => (
            <span className="project-tag" data-tag-kind="use-case" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {(item.href || item.secondaryHref) && (
        <div className="history-links">
          {item.href && (
            <a href={item.href}>
              View
              <ArrowUpRight aria-hidden="true" />
            </a>
          )}
          {item.secondaryHref && (
            <a href={item.secondaryHref}>
              {item.secondaryLabel}
              <ArrowUpRight aria-hidden="true" />
            </a>
          )}
        </div>
      )}
    </article>
  );
}

export function ProjectExplorer({ sections }: ProjectExplorerProps) {
  const [selectedTech, setSelectedTech] = useState("All");
  const [selectedUseCase, setSelectedUseCase] = useState("All");
  const [selectedTimeline, setSelectedTimeline] = useState("All");
  const [demoFilter, setDemoFilter] = useState<DemoFilter>("all");
  const [timelineSort, setTimelineSort] = useState<TimelineSort>("newest");

  const filteredSections = useMemo(() => {
    const sortedSections =
      timelineSort === "newest" ? sections : [...sections].reverse();

    return sortedSections
      .map((section) => ({
        ...section,
        items: projects.filter((project) => {
          if (project.sectionPeriod !== section.period) {
            return false;
          }
          const matchesTech =
            selectedTech === "All" || project.techStack.includes(selectedTech);
          const matchesUseCase =
            selectedUseCase === "All" ||
            project.useCases.includes(selectedUseCase);
          const matchesTimeline =
            selectedTimeline === "All" || project.timeline === selectedTimeline;
          const matchesDemo =
            demoFilter === "all" ||
            (demoFilter === "with-demo" && project.hasDemo) ||
            (demoFilter === "without-demo" && !project.hasDemo);

          return (
            matchesTech && matchesUseCase && matchesTimeline && matchesDemo
          );
        }),
      }))
      .filter((section) => section.items.length > 0);
  }, [
    demoFilter,
    sections,
    selectedTech,
    selectedTimeline,
    selectedUseCase,
    timelineSort,
  ]);

  const activeFilterCount = [
    selectedTech !== "All",
    selectedUseCase !== "All",
    selectedTimeline !== "All",
    demoFilter !== "all",
    timelineSort !== "newest",
  ].filter(Boolean).length;

  const visibleProjectCount = filteredSections.reduce(
    (count, section) => count + section.items.length,
    0,
  );

  function resetFilters() {
    setSelectedTech("All");
    setSelectedUseCase("All");
    setSelectedTimeline("All");
    setDemoFilter("all");
    setTimelineSort("newest");
  }

  return (
    <div className="project-explorer" data-reveal>
      <div className="project-controls" aria-label="Project filters">
        <div className="project-controls-header">
          <div>
            <p className="eyebrow">Sort projects</p>
            <h3>Browse by stack, use case, timeline, or demo.</h3>
          </div>
          <button
            className="reset-filters"
            disabled={activeFilterCount === 0}
            onClick={resetFilters}
            type="button"
          >
            <RotateCcw aria-hidden="true" />
            Reset
          </button>
        </div>

        <div className="filter-group" aria-label="Timeline order">
          <span>Timeline</span>
          <div className="filter-options">
            <FilterButton
              active={timelineSort === "newest"}
              onClick={() => setTimelineSort("newest")}
            >
              Newest first
            </FilterButton>
            <FilterButton
              active={timelineSort === "oldest"}
              onClick={() => setTimelineSort("oldest")}
            >
              Oldest first
            </FilterButton>
          </div>
        </div>

        <div className="filter-group" aria-label="Project tech stack filter">
          <label htmlFor="tech-filter">Tech stack</label>
          <select
            id="tech-filter"
            onChange={(event) => setSelectedTech(event.target.value)}
            value={selectedTech}
          >
            {["All", ...techOptions].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group" aria-label="Project use case filter">
          <label htmlFor="use-case-filter">Use case</label>
          <select
            id="use-case-filter"
            onChange={(event) => setSelectedUseCase(event.target.value)}
            value={selectedUseCase}
          >
            {["All", ...useCaseOptions].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group" aria-label="Timeline era">
          <label htmlFor="timeline-filter">Era</label>
          <select
            id="timeline-filter"
            onChange={(event) => setSelectedTimeline(event.target.value)}
            value={selectedTimeline}
          >
            {["All", ...timelineOptions].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group" aria-label="Demo availability">
          <span>Demo</span>
          <div className="filter-options">
            <FilterButton
              active={demoFilter === "all"}
              onClick={() => setDemoFilter("all")}
            >
              All
            </FilterButton>
            <FilterButton
              active={demoFilter === "with-demo"}
              onClick={() => setDemoFilter("with-demo")}
            >
              Has demo
            </FilterButton>
            <FilterButton
              active={demoFilter === "without-demo"}
              onClick={() => setDemoFilter("without-demo")}
            >
              No demo listed
            </FilterButton>
          </div>
        </div>

        <p className="project-result-count" aria-live="polite">
          Showing {visibleProjectCount} of {projects.length} projects.
        </p>
      </div>

      <div className="history-list">
        {filteredSections.length > 0 ? (
          filteredSections.map((section) => (
            <section className="history-band" key={section.period}>
              <div className="history-band-header">
                <p className="eyebrow">{section.period}</p>
                <h3>{section.title}</h3>
              </div>
              <div className="history-grid">
                {section.items.map((item) => (
                  <div key={item.name}>
                    <ProjectCard item={item} />
                  </div>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="empty-projects" role="status">
            No projects match those filters.
          </div>
        )}
      </div>
    </div>
  );
}
