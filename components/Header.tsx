import clsx from "clsx";
import Link from "next/link";
import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

const navigation = [
  {
    name: "home",
    href: "/",
    enabled: true,
  },
  {
    name: "about",
    href: "/about",
    enabled: false,
  },
  {
    name: "roadmap",
    href: "/roadmap",
    enabled: false,
  },

  {
    name: "vault",
    href: "/vault",
    enabled: false,
  },
  {
    name: "rewards",
    href: "/rewards",
    enabled: false,
  },
];

export default function Example() {
  return (
    <div className="sticky top-0 bg-white z-10 backdrop-blue drop-shadow-lg">
      <Disclosure as="nav" className="bg-transparent">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-28 items-center justify-between">
                <div className="flex items-center w-full">
                  <div className="flex-shrink-0">
                    <Image
                      className="object-cover hidden md:block"
                      src={"/logo.png"}
                      width={100}
                      height={60}
                      alt="logo"
                    />
                    <Image
                      className="object-cover block md:hidden"
                      src={"/logo.png"}
                      width={50}
                      height={30}
                      alt="logo"
                    />
                  </div>
                  <div className="hidden md:flex items-center justify-center flex-1">
                    <div className="ml-10 flex items-center space-x-4 w-full justify-center">
                      {navigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className={clsx(
                            "text-gray-800 px-3 py-2 rounded-md text-lg uppercase font-medium"
                          )}
                          aria-current={item.enabled ? "page" : undefined}
                        >
                          <div className="flex items-center justify-center gap-3">
                            <Image
                              className="object-cover"
                              src={`/navicons/${item.name}.png`}
                              width={40}
                              height={40}
                              alt="logo"
                            />
                            <span>{item.name}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="hidden xl:flex xl:gap-10">
                  <Link href="https://discord.gg/phygitals">
                    <Image
                      className="object-cover"
                      src="/discord.png"
                      width={40}
                      height={40}
                      alt="logo"
                    />
                  </Link>
                  <Link href="https://twitter.com/retrogoons">
                    <Image
                      className="object-cover"
                      src="/twitter.png"
                      width={40}
                      height={40}
                      alt="logo"
                    />
                  </Link>
                </div>
                <div className="hidden md:block">
                  <div className="ml-4 flex items-center md:ml-6">
                    {/* Profile dropdown */}
                    <Menu as="div" className="relative ml-3">
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {navigation.map((item) => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <a
                                  href={item.href}
                                  className={clsx(
                                    active ? "bg-gray-100" : "",
                                    "block px-4 py-2 text-sm text-gray-700"
                                  )}
                                >
                                  {item.name}
                                </a>
                              )}
                            </Menu.Item>
                          ))}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </div>
                <div className="-mr-2 flex md:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-transparent p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel dir="left" className="md:hidden">
              <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    className={clsx(
                      "block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-300 hover:text-gray-800"
                    )}
                    aria-current={item.enabled ? "page" : undefined}
                  >
                    <div className="flex items-center justify-start gap-3">
                      <Image
                        className="object-cover"
                        src={`/navicons/${item.name}.png`}
                        width={20}
                        height={20}
                        alt="logo"
                      />
                      <span>{item.name}</span>
                    </div>
                  </Disclosure.Button>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
}
