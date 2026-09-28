import { permanentRedirect } from "next/navigation";

export default function RequirementsRedirect() {
  permanentRedirect("/admissions#eligibility");
}
