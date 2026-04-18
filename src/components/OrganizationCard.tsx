import Image from "next/image";
import { Organization } from "@/types";
import { Globe, Phone, Mail, ExternalLink, Star } from "lucide-react";

interface OrganizationCardProps {
  organization: Organization;
}

function getStarCount(clickCount: number): number {
  if (clickCount >= 500) return 5;
  if (clickCount >= 100) return 4;
  if (clickCount >= 50) return 3;
  if (clickCount >= 10) return 2;
  if (clickCount >= 1) return 1;
  return 0;
}

export function OrganizationCard({ organization }: OrganizationCardProps) {
  const starCount = getStarCount(organization.clickCount);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-600 flex flex-col gap-4">
      {/* Logo & Name */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center overflow-hidden flex-shrink-0">
          {organization.logoUrl ? (
            <Image
              src={organization.logoUrl}
              alt={`${organization.name} logo`}
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-purple-600 dark:text-purple-400 font-bold text-lg">
              {organization.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-tight">
            {organization.name}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
        {organization.description}
      </p>

      {/* Contact Details */}
      <div className="flex flex-col gap-2 mt-auto">
        {organization.phone && (
          <a
            href={`tel:${organization.phone}`}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{organization.phone}</span>
          </a>
        )}
        {organization.email && (
          <a
            href={`mailto:${organization.email}`}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{organization.email}</span>
          </a>
        )}
        {organization.website && (
          <a
            href={organization.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:underline transition-colors"
          >
            <Globe className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">Visit Website</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        )}
        <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < starCount
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              />
            ))}
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              ({organization.clickCount})
            </span>
          </div>
      </div>
    </div>
  );
}
