import { TopNav } from "@/components/landing/TopNav";
import { FoodNewsWidget } from "@/components/FoodNewsWidget";
import { AIChatAdvisor } from "@/components/AIChatAdvisor";

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans antialiased">
      <TopNav />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 md:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            Malaysian Food Price News
          </h1>
          <p className="mt-1 text-gray-500 text-sm">
            Live geopolitical & market signals affecting your grocery basket.
          </p>
        </div>
        <FoodNewsWidget />
      </main>
      <AIChatAdvisor />
    </div>
  );
}
