const HeaderTag = ({ text, icon }) => {
    return (
      <div className="flex items-center justify-center space-x-3 bg-red-100 text-red-500 px-6 py-2 rounded-full shadow-md w-fit">
        <span className="text-lg font-semibold">{text}</span>
        <span className="text-xl">{icon}</span>
      </div>
    );
  };
  
  export default HeaderTag;
  