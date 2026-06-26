import * as yup from "yup";
import { WORKPLACES, JOB_TYPES, JOB_STATUSES } from "../constants/jobEnums";

const mongoId = yup
  .string()
  .required("Category is required")
  .matches(/^[a-f\d]{24}$/i, "Select a valid category");

export const postJobSchema = yup.object({
  category: mongoId,
  title: yup.string().trim().required("Job title is required"),
  description: yup.string().trim().required("Description is required"),
  workplace: yup.string().oneOf(WORKPLACES, "Select a workplace").required("Workplace is required"),
  jobType: yup.string().oneOf(JOB_TYPES, "Select a job type").required("Job type is required"),
  location: yup.string().trim(),
  skills: yup
    .array()
    .of(yup.string().trim().required())
    .min(1, "Add at least one skill"),
  requirements: yup.string().trim(),
  status: yup.string().oneOf(JOB_STATUSES),
  applicationEnd: yup
    .string()
    .nullable()
    .test("not-past", "Deadline cannot be in the past", (value, context) => {
      if (!value || context.parent.status === "Drafted") return true;
      const deadline = new Date(`${value}T23:59:59`);
      return deadline >= new Date();
    }),
});
