import NewButton from "@/components/NewButton";

export default function NotFound() {
    return (
      <div className="flex h-screen flex-col items-center justify-center px-4 text-center">
        <img
          src="/projectreach.png"
          alt="Project REACH"
          className="h-16 w-auto mb-6"
        />
        <h1 className="text-3xl sm:text-4xl font-bold text-green-700">
          Oops, this page is still a work in progress!
        </h1>
        <p className="mt-4 max-w-md text-gray-600">
        This corner of Project REACH isn’t ready yet, we’re working hard to bring this page to life, check back soon!”
        </p>
        <a
          href="/"
        >
            <NewButton size='medium' className="pt-6">          
                Back to Home
            </NewButton>

        </a>
      </div>
    );
  }