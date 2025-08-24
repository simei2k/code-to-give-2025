import StoriesHomeSection from "@/components/StoriesHomeSection";
import LiveCounter from "@/components/LiveCounter";
import StatCard from "@/components/StatCard";
import { FaMoneyBillWave, FaUserFriends, FaClock, FaUsers, FaCalendarCheck } from "react-icons/fa";
import NewButton from "@/components/NewButton";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section
        className="relative min-h-[80vh] flex flex-col items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: `url('/homepage.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur animate-true-fade-in-slow" />
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center animate-slide-up">
          <div className="bg-white/70 rounded-full p-4 shadow mb-6 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Project REACH Logo"
              className="w-40 md:w-56"
              style={{ filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.3))' }}
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-yellow-400 mb-4 tracking-tight animate-fade-in delay-100">
            Welcome to <span className="text-yellow-500">Project REACH</span>
          </h1>
          <p className="text-2xl md:text-3xl text-white max-w-2xl mb-8 animate-fade-in delay-200">
            Hong Kong's first charity targeting the English proficiency gap among underserved kindergarteners
          </p>
          <div className="flex flex-col md:flex-row gap-8 justify-center animate-fade-in delay-400">
            <a
              href="/stories"
              >
              <NewButton size='medium' color='secondary'>
              Check Out Our Stories
              </NewButton>
            </a>
            <NewButton size='medium'
            >
              Donate Now!
            </NewButton>
          </div>
        </div>
      </section>
      {/* Tailwind Animations - Moved to globals.css */}

      {/* About Section */}
      <section id="about" className="py-20 bg-white text-center">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 flex flex-col items-center md:items-start text-left">
            <h2 className="text-4xl font-bold text-yellow-500 mb-6">Our VISION</h2>
            <p className="text-lg md:text-xl text-gray-700 mb-6">
              Hong Kong is one of the most unequal cities, with <span className="font-bold text-yellow-600">40,000 kindergarten students</span> living in poverty.<br />
              Underfunded kindergartens receive far less support than primary or secondary schools, with <span className="font-bold text-yellow-600">29 closures in 2025-2026</span>, the highest in a decade.
              
              <br />
              Project Reach is the first initiative to address inequality by tackling the English proficiency gap among underserved kindergarten students transitioning to Primary 1.
            </p>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="bg-yellow-100 text-yellow-800 rounded-xl px-6 py-4 shadow font-semibold text-lg flex flex-col items-center w-48 min-w-[180px]">
                <span className="text-4xl font-extrabold">
                  <LiveCounter end={40000} />
                </span>
                <span className="text-sm mt-1 text-center">Kindergarteners living in poverty</span>
              </div>
              <div className="bg-yellow-100 text-yellow-800 rounded-xl px-6 py-4 shadow font-semibold text-lg flex flex-col items-center w-48 min-w-[180px]">
                <span className="text-3xl font-extrabold">
                  <LiveCounter end={29} />
                </span>
                <span className="text-sm mt-1 text-center">Kindergarten closures from <br/> 2025-2026</span>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div
              className="relative w-full max-w-md aspect-[4/3] [perspective:1200px] group cursor-pointer"
              tabIndex={0}
            >
              <div className="absolute inset-0 transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus:[transform:rotateY(180deg)]" id="flip-card-inner">
                {/* Front */}
                <div className="absolute inset-0 rounded-3xl shadow-xl overflow-hidden [backface-visibility:hidden]">
                  <img
                    src="https://reach.org.hk/_assets/media/81c2667e5a8118c922269e0fb3add7a1.jpg"
                    alt="Children in Hong Kong kindergarten"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Back */}
                <div className="absolute inset-0 rounded-3xl shadow-xl flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]" style={{ background: 'rgb(254, 243, 170)' }}>
                  <img
                    src="/starting-line.png"
                    alt="Starting Line Quote"
                    className="w-4/5 h-auto object-contain"
                  />
                </div>
              </div>
            </div>
            <span className="mt-4 text-yellow-700 text-base font-medium animate-fade-in">↺ Flip me for an important message</span>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-20 bg-yellow-50 text-center">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row-reverse items-center gap-10">
          <div className="flex-1 flex flex-col items-center md:items-start text-left">
            <h2 className="text-4xl font-bold text-yellow-600 mb-6">Our MISSION</h2>
            <p className="text-lg md:text-xl text-gray-700 mb-6">
              Project Reach aims to become part of the kindergarten curriculum for schools in need across Hong Kong. We strive to create the first database tracking English proficiency of underserved K3 students to improve programmes and raise awareness of early childhood poverty. Additionally, we aim to secure funding from primary schools to continue supporting students as they transition into Primary 1.
            </p>
          </div>
          <div className="flex-1 flex justify-center mt-8 md:mt-0">
            <img
              src="https://reach.org.hk/_assets/media/b01d719226ecd9a7c170b60d4112dcca.jpg"
              alt="Project Reach Mission"
              className="rounded-3xl shadow-xl w-full max-w-md object-cover aspect-[4/3]"
            />
          </div>
        </div>
      </section>

      {/* Mission Stats Section */}
      <section className="py-14 bg-gradient-to-b from-yellow-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <StatCard 
              label="Raised till date" 
              value={<span className="text-5xl md:text-6xl font-extrabold text-gray-800">$<LiveCounter end={128000} /></span>} 
              accent="bg-gradient-to-tr from-[#f3f3ee] to-[#e6e4d3]" // subtle ochre/earth
              icon={<FaMoneyBillWave className="text-gray-700" />} 
            />
            <StatCard 
              label="Children Supported" 
              value={<span className="text-5xl md:text-6xl font-extrabold text-gray-800"><LiveCounter end={1200} />+</span>} 
              accent="bg-gradient-to-tr from-[#e6d3b3] to-[#bfa77a]" // darker sand/brown
              icon={<FaUserFriends className="text-gray-700" />} 
            />
            <StatCard 
              label="Tutoring Hours Funded" 
              value={<span className="text-5xl md:text-6xl font-extrabold text-gray-800"><LiveCounter end={3400} />+</span>} 
              accent="bg-gradient-to-tr from-[#b3c7b0] to-[#6b8c6a]" // darker earthy green
              icon={<FaClock className="text-gray-700" />} 
            />
            <StatCard 
              label="People have given to our cause" 
              value={<span className="text-5xl md:text-6xl font-extrabold text-gray-800"><LiveCounter end={420} />+</span>} 
              accent="bg-gradient-to-tr from-[#f6e9c2] to-[#e6cfa3]" // orange/brown/mustard yellow
              icon={<FaUsers className="text-gray-700" />} 
            />
            <StatCard 
              label="Donors gave 3 months in a row" 
              value={<span className="text-5xl md:text-6xl font-extrabold text-gray-800"><LiveCounter end={87} /></span>} 
              accent="bg-gradient-to-tr from-[#f3f3ee] to-[#e6e4d3]" // subtle ochre/earth
              icon={<FaCalendarCheck className="text-gray-700" />} 
            />
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-gradient-to-tr from-yellow-50/90 to-yellow-100/90 border border-yellow-100 px-6 py-8 shadow-lg text-yellow-700 font-bold text-lg flex flex-col items-center">
                <span className="text-4xl md:text-5xl mb-2">~39%</span>
                <span className="text-base font-medium mt-1 text-gray-700 text-center">Increased Sight Word Recognition among our children</span>
              </div>
              <div className="rounded-2xl bg-gradient-to-tr from-yellow-50/90 to-yellow-100/90 border border-yellow-100 px-6 py-8 shadow-lg text-yellow-700 font-bold text-lg flex flex-col items-center">
                <span className="text-4xl md:text-5xl mb-2">~73%</span>
                <span className="text-base font-medium mt-1 text-gray-700 text-center">Increased Phonemic Awareness among our children</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stories/Impact Section */}
      <section id="stories" className="py-16 bg-[var(--color-primary)]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-[var(--color-secondary)] text-center mb-8">Our Stories</h2>
          <StoriesHomeSection />
          <div className="flex justify-center mt-8">
            <a href="/stories" >
            <NewButton size='medium' color='secondary'>

              View More Stories
              </NewButton>
            </a>
          </div>
        </div>
      </section>

      {/* Cta Section */}
      <section className="py-20 bg-[var(--color-secondary)] text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Us in Making a Difference</h2>
          <p className="text-lg md:text-xl mb-8">
            Your support can help bridge the gap in education for underprivileged children in Hong Kong. Together, we can create a brighter future.
          </p>
          <a
            href="/donate"
            >
            <NewButton size='medium'>
            Donate Now
            </NewButton>
          </a>
        </div>
      </section>
    </>
  );
}
