import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/medcard/presentation/screens/medcard_screen.dart';
import '../../features/family/presentation/screens/family_screen.dart';
import '../../features/pharmacy/presentation/screens/pharmacy_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';
import '../providers/auth_state_provider.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final isLoggedIn = authState.valueOrNull?.isAuthenticated ?? false;
      final isAuthRoute = state.matchedLocation.startsWith('/auth');

      if (!isLoggedIn && !isAuthRoute) return '/auth/login';
      if (isLoggedIn && isAuthRoute) return '/';
      return null;
    },
    routes: [
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(path: '/', builder: (_, __) => const HomeScreen()),
          GoRoute(path: '/medcard', builder: (_, __) => const MedcardScreen()),
          GoRoute(path: '/family', builder: (_, __) => const FamilyScreen()),
          GoRoute(path: '/pharmacy', builder: (_, __) => const PharmacyScreen()),
          GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
        ],
      ),
      GoRoute(path: '/auth/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/auth/register', builder: (_, __) => const RegisterScreen()),
    ],
  );
});

class MainShell extends StatelessWidget {
  const MainShell({super.key, required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Главная'),
          NavigationDestination(icon: Icon(Icons.folder_outlined), selectedIcon: Icon(Icons.folder), label: 'Медкарта'),
          NavigationDestination(icon: Icon(Icons.people_outline), selectedIcon: Icon(Icons.people), label: 'Семья'),
          NavigationDestination(icon: Icon(Icons.local_pharmacy_outlined), selectedIcon: Icon(Icons.local_pharmacy), label: 'Аптека'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Профиль'),
        ],
        onDestinationSelected: (i) {
          const routes = ['/', '/medcard', '/family', '/pharmacy', '/profile'];
          context.go(routes[i]);
        },
        selectedIndex: _selectedIndex(GoRouterState.of(context).matchedLocation),
      ),
    );
  }

  int _selectedIndex(String location) {
    if (location.startsWith('/medcard')) return 1;
    if (location.startsWith('/family')) return 2;
    if (location.startsWith('/pharmacy')) return 3;
    if (location.startsWith('/profile')) return 4;
    return 0;
  }
}
