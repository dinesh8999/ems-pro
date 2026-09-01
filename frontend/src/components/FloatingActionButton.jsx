const FloatingActionButton = ({ onClick, icon, label, color = "blue" }) => {
  const colorClasses = {
    blue: "icon-container ",
    green: "icon-container ",
    purple: "icon-container ",
    pink: "icon-container ",
  };

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-8 right-8 ${colorClasses[color]} text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 z-50 group`}
      title={label}
    >
      {icon}
      <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-slate-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300">
        {label}
      </span>
    </button>
  );
};

export default FloatingActionButton;






