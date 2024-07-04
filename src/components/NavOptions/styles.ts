import styled from "styled-components";
import { Theme } from "../../common/styles/Theme";
import media from "../../common/styles/MediaScreens";

export const Options = styled.ul`
    list-style: none;
    display: flex;
    flex-direction: row;
    gap: 2rem;
    font-weight: 700;
    font-size: 1rem;
    color: ${Theme.secondaryColor};
    margin-right: auto;

    ${media.mobile} {
        margin: 3rem 0 2rem 0rem;
        flex-direction: column;
        align-items: left;
        font-size: 1.5rem;
    }
`;

export const Option = styled.li`
    transition: 0.3s;
    &:hover {
        transition: 0.3s;
        color: white;
    }
`;