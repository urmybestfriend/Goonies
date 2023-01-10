function Spinner() {
  return (
    <div className={`w-4 h-4`}>
      <div
        className={`w-4 h-4 rounded-full absolute
                            border-2 border-solid border-[#5d5d5d] border-opacity-50`}
      ></div>

      <div
        className={`w-4 h-4 rounded-full animate-spin absolute
                            border-2 border-solid border-white border-t-transparent`}
      ></div>
    </div>
  );
}

export default Spinner;
