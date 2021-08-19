import { IImageCardParameters } from "@microsoft/sp-adaptive-card-extension-base";

export type CompanyArticle = IImageCardParameters & {
    id: number;
    content?: string;
    liked?: boolean;
    likedIconUrl?: string;
};
