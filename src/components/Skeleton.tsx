const Skeleton = () => (
  <div className={`h-[220px] w-[440px] animate-pulse rounded-lg bg-gray-800`}>
    <div className="flex h-full items-center justify-center text-gray-500">
      Loading...
    </div>
  </div>
);

export default Skeleton;
