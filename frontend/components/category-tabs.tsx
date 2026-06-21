const categories = [
  "All",
  "Backend",
  "System Design",
  "Cloud",
  "Docker",
  "Kubernetes",
  "AI",
  "Gaming",
  "Podcasts",
];

export function CategoryTabs() {
  return (
    <div className="flex gap-3 overflow-x-auto">
      {categories.map((category) => (
        <button
          key={category}
          className="whitespace-nowrap rounded-full border px-4 py-2 text-sm hover:bg-muted"
        >
          {category}
        </button>
      ))}
    </div>
  );
}
