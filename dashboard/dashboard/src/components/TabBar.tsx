interface TabBarProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`tab-btn ${activeTab === tab ? 'tab-btn-active' : ''}`}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
