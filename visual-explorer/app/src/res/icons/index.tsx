import React from 'react';
import { ReactComponent as SDLLogoWhiteSVG } from 'res/icons/sdl-logo_white.svg';
import { ReactComponent as SDLLogoBlueSVG } from 'res/icons/sdl-logo_blue.svg';
import { ReactComponent as SDLLogoPurpleSVG } from 'res/icons/sdl-logo_purple.svg';

interface SizeProps {
    size: number;
}

type IconProps = SizeProps & React.HTMLProps<SVGSVGElement>;

const toElementProps = (props: IconProps) => {
    const { size, ...remainingProps } = props;
    return {
        ...remainingProps,
        width: size,
        height: size,
    };
};

const SDLLogoWhite: React.FunctionComponent<IconProps> = (props: IconProps) =>
    React.cloneElement(<SDLLogoWhiteSVG />, toElementProps(props));

const SDLLogoBlue: React.FunctionComponent<IconProps> = (props: IconProps) =>
    React.cloneElement(<SDLLogoBlueSVG />, toElementProps(props));

const SDLLogoPurple: React.FunctionComponent<IconProps> = (props: IconProps) =>
    React.cloneElement(<SDLLogoPurpleSVG />, toElementProps(props));

const Icons = {
    SDLLogoWhite,
    SDLLogoBlue,
    SDLLogoPurple,
};

export default Icons;
